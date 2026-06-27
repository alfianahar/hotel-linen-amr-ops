import { useState, useCallback, useRef, useEffect } from 'react'
import { ALL_FLOORS, getFloorById } from '../MapStage/floors'
import { ITrolley, ETrolleyType, RobotMoveOptions } from '../MapStage/types'
import MapStage from '../MapStage'
import { useStorage } from '../contexts/StorageContext'
import Navbar from '../components/navbar'
import FloorSelector from '../components/FloorSelector'
import { Bot, ListTodo } from 'lucide-react'

type Popover = 'robots' | 'tasks' | null

export default function DashboardPage() {
  const [selectedFloorId, setSelectedFloorId] = useState('basement')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [popover, setPopover] = useState<Popover>(null)
  const currentFloor = getFloorById(selectedFloorId)
  const popoverRef = useRef<HTMLDivElement>(null)

  const {
    getTrolleyState, assignTrolley, removeTrolley, moveTrolley,
    executeMove, queueMove, updateTrolleyType,
    getRobots, getRobotLocation, getAvailableTrolleys, getQueues
  } = useStorage()

  const trolleyState = getTrolleyState()
  const robots = getRobots()
  const allQueues = getQueues()
  const allFloorAPIds = ALL_FLOORS.flatMap(f =>
    f.boxes.filter(b => b.type === 'AP' as any).map(b => b.id)
  )

  useEffect(() => {
    if (!popover) return
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setPopover(null)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [popover])

  const robotOptions = robots.map(r => ({
    ip: r.ip_address,
    name: r.name,
    charging_point: r.charging_point,
    currentStation: getRobotLocation(r.ip_address)?.current_station ?? null,
  }))

  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }, [])

  const handleAssignTrolley = useCallback(async (apId: string, trolleyId: number) => {
    assignTrolley(apId, trolleyId)
    showMessage('success', `Trolley #${trolleyId} assigned to ${apId}`)
  }, [assignTrolley, showMessage])

  const handleRemoveTrolley = useCallback(async (apId: string) => {
    removeTrolley(apId)
    showMessage('success', `Trolley removed from ${apId}`)
  }, [removeTrolley, showMessage])

  const handleMoveTrolley = useCallback(async (from: string, to: string) => {
    moveTrolley(from, to)
    showMessage('success', `Trolley moved: ${from} → ${to}`)
  }, [moveTrolley, showMessage])

  const handleExecuteMove = useCallback(async (
    from: string, to: string, robotIp: string,
    srcArea: string, srcFloor: number, dstArea: string, dstFloor: number,
    _opts?: RobotMoveOptions
  ) => {
    showMessage('success', `Robot moving trolley: ${from} → ${to}...`)
    try {
      await executeMove(from, to, robotIp)
      showMessage('success', `Trolley delivered to ${to}`)
    } catch {
      showMessage('error', 'Move failed')
    }
  }, [executeMove, showMessage])

  const handleQueueMove = useCallback(async (
    from: string, to: string, robotIp: string,
    _srcArea: string, _srcFloor: number, _dstArea: string, _dstFloor: number,
    _opts?: RobotMoveOptions
  ) => {
    queueMove(from, to, robotIp)
    showMessage('success', `Move queued: ${from} → ${to}`)
  }, [queueMove, showMessage])

  const handleUpdateTrolleyType = useCallback(async (id: number, type: ETrolleyType) => {
    updateTrolleyType(id, type)
    showMessage('success', `Trolley #${id} updated to ${type}`)
  }, [updateTrolleyType, showMessage])

  const handleExecuteTargetMove = useCallback(async (
    _from: string, to: string, robotIp: string,
    _srcArea: string, _srcFloor: number, _dstArea: string, _dstFloor: number,
    _opts?: { signal?: AbortSignal }
  ) => {
    showMessage('success', `Robot ${robotIp} navigating to ${to}`)
  }, [showMessage])

  const handleQueueTargetMove = useCallback(async (
    _from: string, to: string, robotIp: string,
    _srcArea: string, _srcFloor: number, _dstArea: string, _dstFloor: number,
  ) => {
    showMessage('success', `Navigation to ${to} queued for ${robotIp}`)
  }, [showMessage])

  const handleCabinetDoor = useCallback(async (action: 'OpenDoor' | 'CloseDoor') => {
    showMessage('success', `${action === 'OpenDoor' ? 'Opening' : 'Closing'} RFID cabinet door`)
  }, [showMessage])

  const handleCancelExecute = useCallback(async (_robotIp: string) => {
    showMessage('success', 'Execution cancelled')
  }, [showMessage])

  const handleExecuteRfidMove = useCallback(async (
    _from: string, _robotIp: string,
    _srcArea: string, _srcFloor: number,
  ) => {
    showMessage('success', 'RFID move executed')
  }, [showMessage])

  const handleQueueRfidMove = useCallback(async (
    _from: string, _robotIp: string,
    _srcArea: string, _srcFloor: number,
  ) => {
    showMessage('success', 'RFID move queued')
  }, [showMessage])

  const handleExecuteRfidReturn = useCallback(async (
    _to: string, _robotIp: string,
    _dstArea: string, _dstFloor: number,
  ) => {
    showMessage('success', 'RFID return executed')
  }, [showMessage])

  const handleQueueRfidReturn = useCallback(async (
    _to: string, _robotIp: string,
    _dstArea: string, _dstFloor: number,
  ) => {
    showMessage('success', 'RFID return queued')
  }, [showMessage])

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#f5f5f5]">
      <Navbar />

      {/* Toast */}
      {message && (
        <div className="fixed top-16 right-4 z-[100] p-3 rounded-lg border shadow-lg text-sm font-medium animate-in slide-in-from-top-2"
          style={{
            backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
            borderColor: message.type === 'success' ? '#86efac' : '#fecaca',
            color: message.type === 'success' ? '#166534' : '#991b1b',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Map area fills the full available space */}
      <div className="flex-1 relative min-h-0">
        {/* Floor selector overlay */}
        <div className="absolute top-3 left-3 z-20">
          <FloorSelector
            floors={ALL_FLOORS}
            selectedFloorId={selectedFloorId}
            onFloorChange={setSelectedFloorId}
          />
        </div>

        {/* Top-right icon buttons (Fleet / Tasks popovers) */}
        <div ref={popoverRef} className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1.5">
          <div className="flex gap-1">
            <IconBtn title={`Fleet (${robots.length})`} active={popover === 'robots'} onClick={() => setPopover(p => p === 'robots' ? null : 'robots')}>
              <Bot size={16} />
              {robots.length > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">{robots.length}</span>}
            </IconBtn>
            <IconBtn title={`Tasks (${allQueues.filter(q => q.status !== 'completed' && q.status !== 'cancelled' && q.status !== 'failed').length})`} active={popover === 'tasks'} onClick={() => setPopover(p => p === 'tasks' ? null : 'tasks')}>
              <ListTodo size={16} />
              {allQueues.filter(q => q.status !== 'completed' && q.status !== 'cancelled' && q.status !== 'failed').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {allQueues.filter(q => q.status !== 'completed' && q.status !== 'cancelled' && q.status !== 'failed').length}
                </span>
              )}
            </IconBtn>
          </div>

          {popover === 'robots' && (
            <div className="bg-white border rounded-lg shadow-lg p-3 w-[300px] text-xs">
              <div className="font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><Bot size={13} /> Fleet</div>
              {robots.length === 0 && <div className="text-gray-400 text-center py-3">No robots. Add some in the Library.</div>}
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {robots.map(r => {
                  const qCount = allQueues.filter(q => q.robot_ip === r.ip_address && (q.status === 'queued' || q.status === 'running')).length
                  return (
                    <div key={r.id} className="flex items-center gap-2 border rounded-md px-2 py-1.5 bg-gray-50">
                      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                      <span className="font-semibold truncate">{r.name}</span>
                      <span className="text-gray-400 font-mono text-[10px] truncate">{r.ip_address}</span>
                      <span className="ml-auto text-[10px] text-gray-500 shrink-0">at {r.charging_point ?? getRobotLocation(r.ip_address)?.current_station ?? '—'}</span>
                      {qCount > 0 && <span className="bg-blue-100 text-blue-700 px-1.5 rounded-full text-[9px] font-semibold">{qCount}q</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {popover === 'tasks' && (
            <div className="bg-white border rounded-lg shadow-lg p-3 w-[320px] text-xs">
              <div className="font-semibold text-gray-700 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><ListTodo size={13} /> Task Queue</span>
                <div className="flex gap-1 text-[10px]">
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded-full font-semibold">{allQueues.filter(q => q.status === 'queued').length} q</span>
                  <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">{allQueues.filter(q => q.status === 'running').length} r</span>
                  <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">{allQueues.filter(q => q.status === 'completed').length} ✓</span>
                </div>
              </div>
              {allQueues.length === 0 && <div className="text-gray-400 text-center py-3">No tasks queued.</div>}
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {allQueues.map(q => (
                  <div key={q.id} className="flex items-center gap-2 border rounded-md px-2 py-1.5 bg-gray-50">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      q.status === 'completed' ? 'bg-green-500' :
                      q.status === 'running' ? 'bg-blue-500 animate-pulse' :
                      q.status === 'cancelled' ? 'bg-orange-500' :
                      q.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 rounded-full font-semibold">{q.task_type}</span>
                    <span className="text-gray-500 font-mono text-[10px] truncate">{q.robot_ip}</span>
                    <span className="ml-auto text-[10px] text-gray-500 shrink-0">{q.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <MapStage
          config={currentFloor.mapConfig}
          boxes={currentFloor.boxes}
          showLegend={true}
          floorLabel={currentFloor.label}
          regions={currentFloor.regions}
          currentFloorAPIds={currentFloor.boxes.filter(b => b.type === 'AP' as any).map(b => b.id)}
          allFloorAPIds={allFloorAPIds}
          trolleyMap={trolleyState.assignmentMap}
          trolleyRegistry={trolleyState.registry}
          onTrolleyAssign={handleAssignTrolley}
          onTrolleyRemove={handleRemoveTrolley}
          onTrolleyMove={handleMoveTrolley}
          onUpdateTrolleyType={handleUpdateTrolleyType}
          robots={robotOptions}
          onExecuteMove={handleExecuteMove}
          onExecuteTargetMove={handleExecuteTargetMove}
          onQueueTargetMove={handleQueueTargetMove}
          onQueueMove={handleQueueMove}
          onExecuteRfidMove={handleExecuteRfidMove}
          onQueueRfidMove={handleQueueRfidMove}
          onExecuteRfidReturn={handleExecuteRfidReturn}
          onQueueRfidReturn={handleQueueRfidReturn}
          onCancelExecute={handleCancelExecute}
          onCabinetDoorAction={handleCabinetDoor}
        />
      </div>
    </div>
  )
}

const IconBtn: React.FC<{ title: string; active?: boolean; onClick: () => void; children: React.ReactNode }> = ({ title, active, onClick, children }) => (
  <button
    onClick={onClick}
    title={title}
    className={`relative w-8 h-8 rounded-md border flex items-center justify-center transition-colors ${active ? 'bg-primary text-white border-primary' : 'bg-white/95 text-gray-700 border-gray-300 hover:bg-gray-50'}`}
  >
    {children}
  </button>
)
