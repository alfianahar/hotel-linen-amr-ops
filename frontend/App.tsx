import { Routes, Route, Navigate } from 'react-router-dom'
import { StorageProvider } from './contexts/StorageContext'
import DashboardPage from './pages/dashboard'
import LibraryPage from './pages/library'
import TasksPage from './pages/tasks'
import AutomationPage from './pages/automation'
import LiftPage from './pages/lift'

function App() {
  return (
    <StorageProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/automation" element={<AutomationPage />} />
        <Route path="/lift" element={<LiftPage />} />
      </Routes>
    </StorageProvider>
  )
}

export default App
