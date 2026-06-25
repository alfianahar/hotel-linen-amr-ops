import { Routes, Route, Navigate } from 'react-router-dom'
import { StorageProvider } from './contexts/StorageContext'
import MapStage from './MapStage'
import { ALL_FLOORS, getFloorById } from './MapStage/floors'
import { useStorage } from './contexts/StorageContext'

function App() {
  return (
    <StorageProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </StorageProvider>
  )
}

function DashboardPage() {
  const floor = getFloorById('basement')
  const { getTrolleyState, getRobots, getRobotLocation } = useStorage()
  const trolleyState = getTrolleyState()
  const robots = getRobots()

  const robotOptions = robots.map(r => ({
    ip: r.ip_address,
    name: r.name,
    charging_point: r.charging_point,
    currentStation: getRobotLocation(r.ip_address)?.current_station ?? null,
  }))

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <div className="h-14 bg-white border-b flex items-center px-4 gap-4 shrink-0">
        <span className="font-bold text-base">Hotel Linen Ops</span>
        <div className="flex-1" />
        <button className="text-xs text-muted-foreground hover:text-foreground">Library</button>
        <button className="text-xs text-muted-foreground hover:text-foreground">Tasks</button>
        <button className="text-xs text-muted-foreground hover:text-foreground">Lift</button>
      </div>
      <div className="flex-1 relative min-h-0">
        <MapStage
          config={floor.mapConfig}
          boxes={floor.boxes}
          showLegend={true}
          floorLabel={floor.label}
          regions={floor.regions}
          trolleyMap={trolleyState.assignmentMap}
          trolleyRegistry={trolleyState.registry}
          robots={robotOptions}
        />
      </div>
    </div>
  )
}

export default App
