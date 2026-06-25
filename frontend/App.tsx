import { Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPlaceholder />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function DashboardPlaceholder() {
  return (
    <div className="flex items-center justify-center h-full text-lg text-muted-foreground">
      Dashboard — coming soon
    </div>
  )
}

export default App
