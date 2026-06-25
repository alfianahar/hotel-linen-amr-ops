import { Routes, Route, Navigate } from 'react-router-dom'
import MapStage from './MapStage'
import { ALL_FLOORS, getFloorById } from './MapStage/floors'

function App() {
  const floor = getFloorById('basement')

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <div className="h-14 bg-white border-b flex items-center px-4 shrink-0">
        <span className="font-bold text-base">Hotel Linen Ops</span>
      </div>
      <div className="flex-1 relative min-h-0">
        <MapStage
          config={floor.mapConfig}
          boxes={floor.boxes}
          showLegend={true}
          floorLabel={floor.label}
          regions={floor.regions}
          trolleyMap={{}}
          trolleyRegistry={[]}
          robots={[]}
        />
      </div>
    </div>
  )
}

export default App
