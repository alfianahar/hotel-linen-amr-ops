import { useState } from 'react'
import Navbar from '../components/navbar'
import { useStorage } from '../contexts/StorageContext'

export default function TasksPage() {
  const { getQueues, cancelQueue, clearRobotQueue, runTaskQueue, getRobots, store } = useStorage()
  const robots = getRobots()
  const [selectedRobot, setSelectedRobot] = useState(robots[0]?.ip_address ?? '')
  const allQueues = getQueues()
  const queues = selectedRobot ? getQueues(selectedRobot) : allQueues
  const [running, setRunning] = useState(false)

  const handleRunSequential = async () => {
    if (!selectedRobot) return
    setRunning(true)
    await runTaskQueue(selectedRobot)
    setRunning(false)
  }

  return (
    <div className="h-screen flex flex-col bg-[#f5f5f5]">
      <Navbar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Task Queue</h1>
            <div className="flex items-center gap-2">
              <select className="text-xs border rounded px-2 py-1.5" value={selectedRobot} onChange={e => setSelectedRobot(e.target.value)}>
                {robots.map(r => <option key={r.ip_address} value={r.ip_address}>{r.name}</option>)}
                <option value="">All Robots</option>
              </select>
              <button className="text-xs bg-primary text-white rounded px-3 py-1.5 font-medium disabled:opacity-50" disabled={running} onClick={handleRunSequential}>
                {running ? 'Running...' : 'Run Sequential'}
              </button>
              <button className="text-xs border border-red-300 text-red-700 rounded px-3 py-1.5 font-medium" onClick={() => { if (selectedRobot) clearRobotQueue(selectedRobot) }}>
                Clear Queue
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50"><th className="px-4 py-3 text-left font-medium">ID</th><th className="px-4 py-3 text-left font-medium">Robot</th><th className="px-4 py-3 text-left font-medium">Type</th><th className="px-4 py-3 text-left font-medium">Status</th><th className="px-4 py-3 text-left font-medium">Actions</th></tr></thead>
              <tbody>
                {queues.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No queued tasks</td></tr>}
                {queues.map(q => (
                  <tr key={q.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-muted-foreground">{q.id}</td>
                    <td className="px-4 py-3">{q.robot_ip}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{q.task_type}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        q.status === 'completed' ? 'bg-green-100 text-green-700' :
                        q.status === 'running' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                        q.status === 'cancelled' ? 'bg-orange-100 text-orange-700' :
                        q.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{q.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {(q.status === 'queued' || q.status === 'running') && (
                        <button className="text-xs border border-red-300 text-red-700 rounded px-2 py-1" onClick={() => cancelQueue(q.id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
