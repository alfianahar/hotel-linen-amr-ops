import { useState } from 'react'
import Navbar from '../components/navbar'

export default function LiftPage() {
  const [floor, setFloor] = useState('1')
  const [status, setStatus] = useState<string | null>(null)
  const [calling, setCalling] = useState(false)

  const handleCall = async () => {
    setCalling(true)
    setStatus(`Calling lift to floor ${floor}...`)
    await new Promise(r => setTimeout(r, 2000))
    setStatus(`Lift arrived at floor ${floor}`)
    setCalling(false)
  }

  return (
    <div className="h-screen flex flex-col bg-[#f5f5f5]">
      <Navbar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold mb-4">Lift Control</h1>
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Call To Floor</label>
              <select className="w-full mt-1 border rounded px-3 py-2 text-sm" value={floor} onChange={e => setFloor(e.target.value)}>
                {['B', '1', '2', '3', '4', '5', '6', '7', '8'].map(f => (
                  <option key={f} value={f === 'B' ? '0' : f}>{f === 'B' ? 'Basement' : `Floor ${f}`}</option>
                ))}
              </select>
            </div>
            <button className="w-full bg-primary text-white rounded-lg px-4 py-3 font-semibold text-sm disabled:opacity-50" disabled={calling} onClick={handleCall}>
              {calling ? 'Calling...' : 'Call Lift'}
            </button>
            {status && (
              <div className="text-sm p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">{status}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
