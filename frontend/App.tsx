import { Routes, Route, Navigate } from 'react-router-dom'
import { StorageProvider } from './contexts/StorageContext'
import DashboardPage from './pages/dashboard'

function App() {
  return (
    <StorageProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/library" element={<Placeholder title="Library" />} />
        <Route path="/tasks" element={<Placeholder title="Tasks" />} />
        <Route path="/automation" element={<Placeholder title="Automation" />} />
        <Route path="/lift" element={<Placeholder title="Lift" />} />
      </Routes>
    </StorageProvider>
  )
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-muted-foreground">
      <span className="text-lg font-semibold">{title}</span>
      <span className="text-sm">Coming soon</span>
    </div>
  )
}

export default App
