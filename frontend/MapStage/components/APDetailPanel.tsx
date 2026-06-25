import React, { useState } from 'react'
import { Play, Square, ArrowRight } from 'lucide-react'
import { ITrolleyAssignment, ITrolley, IRobotOption, ETrolleyType, RobotMoveOptions } from '../types'
import { TROLLEY_TYPE_COLORS, TROLLEY_TYPE_LABELS } from '../constants'

export type PanelMode =
  | { kind: 'detail'; apId: string; apLabel: string; stationType?: 'ap' | 'lm' | 'cp' }
  | { kind: 'selectDest'; sourceApId: string; sourceApLabel: string; trolley: ITrolley; sourceArea: string; sourceFloor: number }
  | { kind: 'confirmMove'; sourceApId: string; sourceApLabel: string; destApId: string; destApLabel: string; trolley: ITrolley; sourceArea: string; sourceFloor: number; destArea: string; destFloor: number }
  | { kind: 'confirmTargetMove'; sourceApId: string; sourceApLabel: string; destApId: string; destApLabel: string; sourceArea: string; sourceFloor: number; destArea: string; destFloor: number; destStationType?: string }
  | { kind: 'confirmRfidMove'; sourceApId: string; sourceApLabel: string; trolley: ITrolley; sourceArea: string; sourceFloor: number }
  | { kind: 'selectRfidReturnDest'; sourceApId: string; sourceApLabel: string; trolley: ITrolley; sourceArea: string; sourceFloor: number; allowedRobotIps: string[] }
  | { kind: 'confirmRfidReturn'; sourceApId: string; sourceApLabel: string; destApId: string; destApLabel: string; trolley: ITrolley; sourceArea: string; sourceFloor: number; destArea: string; destFloor: number; allowedRobotIps: string[] }

interface Props {
  mode: PanelMode
  assignment: ITrolleyAssignment | null
  assignedTrolleyIds: Set<number>
  trolleyRegistry: ITrolley[]
  onAssignTrolley: (apId: string, trolleyId: number, area: string, floor: number) => void
  onRemoveTrolley: (apId: string) => void
  onUpdateTrolleyType: (trolleyId: number, type: ETrolleyType) => void
  onStartMove: () => void
  onStartTargetMove: () => void
  onConfirmMove: (fromApId: string, toApId: string) => Promise<void>
  robots: IRobotOption[]
  onExecuteMove?: (from: string, to: string, robotIp: string, srcArea: string, srcFloor: number, dstArea: string, dstFloor: number, opts?: RobotMoveOptions) => Promise<void>
  onExecuteTargetMove?: (from: string, to: string, robotIp: string, srcArea: string, srcFloor: number, dstArea: string, dstFloor: number, opts?: { signal?: AbortSignal }) => Promise<void>
  onQueueTargetMove?: (from: string, to: string, robotIp: string, srcArea: string, srcFloor: number, dstArea: string, dstFloor: number) => Promise<void>
  onQueueMove?: (from: string, to: string, robotIp: string, srcArea: string, srcFloor: number, dstArea: string, dstFloor: number, opts?: RobotMoveOptions) => Promise<void>
  onExecuteRfidMove?: (from: string, robotIp: string, srcArea: string, srcFloor: number) => Promise<void>
  onQueueRfidMove?: (from: string, robotIp: string, srcArea: string, srcFloor: number) => Promise<void>
  onExecuteRfidReturn?: (to: string, robotIp: string, dstArea: string, dstFloor: number) => Promise<void>
  onQueueRfidReturn?: (to: string, robotIp: string, dstArea: string, dstFloor: number) => Promise<void>
  onCancelExecute?: (robotIp: string) => void
  onCabinetDoorAction?: (action: 'OpenDoor' | 'CloseDoor') => Promise<void>
  onActionError: (msg: string) => void
  onCancelMove: () => void
  onClose: () => void
  abortRef: React.MutableRefObject<(() => void) | null>
}

const robotOptionLabels = (robots: IRobotOption[]) =>
  robots.length === 0
    ? [{ value: '', label: 'No robots available' }]
    : [{ value: '__auto_assign__', label: 'Auto-assign' }, ...robots.map(r => ({ value: r.ip, label: `${r.name} (${r.ip})` }))]

const APDetailPanel: React.FC<Props> = ({
  mode, assignment, assignedTrolleyIds, trolleyRegistry, onAssignTrolley, onRemoveTrolley,
  onUpdateTrolleyType, onStartMove, onStartTargetMove, onConfirmMove, robots,
  onExecuteMove, onExecuteTargetMove, onQueueTargetMove, onQueueMove,
  onExecuteRfidMove, onQueueRfidMove, onExecuteRfidReturn, onQueueRfidReturn,
  onCancelExecute, onCabinetDoorAction, onActionError, onCancelMove, onClose, abortRef,
}) => {
  const [selectedTrolleyId, setSelectedTrolleyId] = useState<number | null>(null)
  const [selectedRobotIp, setSelectedRobotIp] = useState('__auto_assign__')
  const [executing, setExecuting] = useState(false)
  const availableTrolleys = trolleyRegistry.filter(t => !assignedTrolleyIds.has(t.id) || (assignment && t.id === assignment.trolley.id))
  const robotOpts = robotOptionLabels(robots)
  const isRfidStation = mode.kind === 'detail' && (mode.apId === 'LM34' || mode.stationType === 'lm' && mode.apLabel.includes('RFID'))
  const isDetail = mode.kind === 'detail'
  const isSelectDest = mode.kind === 'selectDest'
  const isConfirmMove = mode.kind === 'confirmMove'
  const isConfirmTarget = mode.kind === 'confirmTargetMove'

  const wrapExec = async <T,>(fn: () => Promise<T>) => {
    setExecuting(true)
    try { await fn() } catch (e: any) { onActionError(e?.message ?? 'Action failed') }
    finally { setExecuting(false) }
  }

  return (
    <div className="absolute top-0 right-0 w-[280px] h-full bg-white border-l z-30 flex flex-col overflow-y-auto shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-gray-50">
        <span className="font-bold text-sm">{mode.kind === 'detail' ? mode.apLabel : `Move Trolley #'trolley'`}</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl leading-none">&times;</button>
      </div>
      <div className="p-3 flex flex-col gap-3 text-sm">
        {isDetail && (
          <>
            <div><span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Station</span><div className="font-semibold">{mode.apId}</div></div>
            {assignment && (
              <div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Trolley</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: TROLLEY_TYPE_COLORS[assignment.trolley.type] }} />
                  <span className="font-semibold">#{assignment.trolley.id}</span>
                  <span className="text-xs text-gray-500">({TROLLEY_TYPE_LABELS[assignment.trolley.type]})</span>
                </div>
                <select className="mt-1 w-full text-xs border rounded px-2 py-1" value={assignment.trolley.type}
                  onChange={e => onUpdateTrolleyType(assignment.trolley.id, e.target.value as ETrolleyType)}>
                  {Object.values(ETrolleyType).map(t => <option key={t} value={t}>{TROLLEY_TYPE_LABELS[t]}</option>)}
                </select>
              </div>
            )}

            {/* Trolley assign/remove */}
            {!assignment ? (
              <div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Assign Trolley</span>
                <select className="mt-1 w-full text-xs border rounded px-2 py-1.5" value={selectedTrolleyId ?? ''} onChange={e => setSelectedTrolleyId(e.target.value ? Number(e.target.value) : null)}>
                  <option value="">-- Select --</option>
                  {availableTrolleys.map(t => <option key={t.id} value={t.id}>#{t.id} ({TROLLEY_TYPE_LABELS[t.type]})</option>)}
                </select>
                <button className="mt-1 w-full text-xs bg-primary text-white rounded px-2 py-1.5 font-semibold disabled:opacity-50" disabled={!selectedTrolleyId || executing}
                  onClick={() => selectedTrolleyId && onAssignTrolley(mode.apId, selectedTrolleyId, '', 0)}>Assign</button>
              </div>
            ) : (
              <button className="w-full text-xs border border-red-300 text-red-700 rounded px-2 py-1.5 font-semibold hover:bg-red-50"
                onClick={() => onRemoveTrolley(mode.apId)}>Remove Trolley</button>
            )}

            {/* Execute / Queue move */}
            {assignment && (
              <>
                <div className="border-t pt-2">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Execute / Queue Move</span>
                  <select className="mt-1 w-full text-xs border rounded px-2 py-1.5" value={selectedRobotIp} onChange={e => setSelectedRobotIp(e.target.value)}>
                    {robotOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <div className="flex gap-1 mt-1">
                    <button className="flex-1 flex items-center justify-center gap-1 text-xs bg-primary text-white rounded px-2 py-1.5 font-semibold disabled:opacity-50"
                      disabled={executing} onClick={() => {
                        wrapExec(async () => {
                          if (mode.kind === 'detail' && assignment) {
                            onStartMove()
                          }
                        })
                      }}><Play size={12} /> Move</button>
                    <button className="flex-1 flex items-center justify-center gap-1 text-xs border rounded px-2 py-1.5 font-semibold disabled:opacity-50"
                      disabled={executing} onClick={() => {
                        wrapExec(async () => {
                          onStartTargetMove()
                        })
                      }}><ArrowRight size={12} /> Go To</button>
                  </div>
                </div>
              </>
            )}

            {isRfidStation && (
              <div className="border-t pt-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">RFID Cabinet</span>
                <div className="flex gap-1 mt-1">
                  <button className="flex-1 text-xs bg-green-600 text-white rounded px-2 py-1.5 font-semibold" onClick={() => onCabinetDoorAction?.('OpenDoor')}>Open</button>
                  <button className="flex-1 text-xs bg-gray-600 text-white rounded px-2 py-1.5 font-semibold" onClick={() => onCabinetDoorAction?.('CloseDoor')}>Close</button>
                </div>
              </div>
            )}
          </>
        )}

        {isSelectDest && (
          <div className="text-xs text-gray-500">Select destination station on the map. Click any AP to set destination.</div>
        )}

        {isConfirmMove && (
          <>
            <div className="text-xs font-semibold text-primary">Confirm Move</div>
            <div className="text-xs">Trolley #{mode.trolley.id}: {mode.sourceApLabel} → {mode.destApLabel}</div>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={selectedRobotIp} onChange={e => setSelectedRobotIp(e.target.value)}>
              {robotOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="flex gap-1">
              <button className="flex-1 text-xs bg-primary text-white rounded px-2 py-1.5 font-semibold disabled:opacity-50" disabled={executing}
                onClick={() => wrapExec(() => onConfirmMove(mode.sourceApId, mode.destApId))}>Confirm</button>
              <button className="flex-1 text-xs border rounded px-2 py-1.5 font-semibold" onClick={onCancelMove}>Cancel</button>
            </div>
          </>
        )}

        {isConfirmTarget && (
          <>
            <div className="text-xs font-semibold">Navigate to {mode.destApLabel}</div>
            <select className="w-full text-xs border rounded px-2 py-1.5" value={selectedRobotIp} onChange={e => setSelectedRobotIp(e.target.value)}>
              {robotOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="flex gap-1">
              <button className="flex-1 text-xs bg-primary text-white rounded px-2 py-1.5 font-semibold disabled:opacity-50" disabled={executing}
                onClick={() => {}}>Confirm</button>
              <button className="flex-1 text-xs border rounded px-2 py-1.5 font-semibold" onClick={onCancelMove}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default APDetailPanel
