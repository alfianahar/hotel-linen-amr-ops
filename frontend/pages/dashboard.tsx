import { useState, useCallback } from 'react'
import { ALL_FLOORS, getFloorById } from '../MapStage/floors'
import { ITrolley, ETrolleyType, RobotMoveOptions } from '../MapStage/types'
import MapStage from '../MapStage'
import { useStorage } from '../contexts/StorageContext'
import Navbar from '../components/navbar'
import FloorSelector from '../components/FloorSelector'

export default function DashboardPage() {
  const [selectedFloorId, setSelectedFloorId] = useState('basement')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const currentFloor = getFloorById(selectedFloorId)

  const {
    getTrolleyState, assignTrolley, removeTrolley, moveTrolley,
    executeMove, queueMove, updateTrolleyType,
    getRobots, getRobotLocation, getAvailableTrolleys
  } = useStorage()

  const trolleyState = getTrolleyState()
  const robots = getRobots()
  const allFloorAPIds = ALL_FLOORS.flatMap(f =>
    f.boxes.filter(b => b.type === 'AP' as any).map(b => b.id)
  )

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

      {/* Map area */}
      <div className="flex-1 relative min-h-0">
        {/* Floor selector overlay */}
        <div className="absolute top-3 left-3 z-20">
          <FloorSelector
            floors={ALL_FLOORS}
            selectedFloorId={selectedFloorId}
            onFloorChange={setSelectedFloorId}
          />
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
