import { useState } from 'react'
import Navbar from '../components/navbar'
import { useStorage } from '../contexts/StorageContext'

export default function LibraryPage() {
  const { getTasks, store } = useStorage()
  const tasks = getTasks()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.type === filter)

  return (
    <div className="h-screen flex flex-col bg-[#f5f5f5]">
      <Navbar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Task Library</h1>
            <select className="text-xs border rounded px-2 py-1.5" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="chute">Chute</option>
              <option value="trolley">Trolley</option>
              <option value="robot">Robot</option>
              <option value="door">Door</option>
              <option value="lift">Lift</option>
              <option value="cabinet">Cabinet</option>
            </select>
          </div>
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50"><th className="px-4 py-3 text-left font-medium">ID</th><th className="px-4 py-3 text-left font-medium">Name</th><th className="px-4 py-3 text-left font-medium">Type</th><th className="px-4 py-3 text-left font-medium">API Path</th></tr></thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-muted-foreground">{t.id}</td>
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t.type}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{t.api_path}</td>
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
