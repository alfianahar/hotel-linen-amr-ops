import { useState } from 'react'
import Navbar from '../components/navbar'
import { useStorage } from '../contexts/StorageContext'

interface RobotForm {
  name: string
  ip_address: string
  robot_key: string
  charging_point: string
  priority: number
  task_master_max_active: number
}

const empty: RobotForm = { name: '', ip_address: '', robot_key: '', charging_point: '', priority: 5, task_master_max_active: 2 }

const MAX_ROBOTS = 2

export default function LibraryPage() {
  const { getRobots, addRobot, updateRobot, removeRobot } = useStorage()
  const robots = getRobots()
  const atCap = robots.length >= MAX_ROBOTS
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<RobotForm>(empty)
  const [showAdd, setShowAdd] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const startAdd = () => { setShowAdd(true); setEditingId(null); setForm({ ...empty, ip_address: nextIp(robots) }) }
  const startEdit = (r: ReturnType<typeof getRobots>[number]) => {
    setEditingId(r.id); setShowAdd(false)
    setForm({ name: r.name, ip_address: r.ip_address, robot_key: r.robot_key ?? '', charging_point: r.charging_point ?? '', priority: r.priority, task_master_max_active: r.task_master_max_active })
  }
  const cancel = () => { setEditingId(null); setShowAdd(false); setForm(empty) }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.ip_address.trim()) return
    if (showAdd && robots.length >= MAX_ROBOTS) return
    const data = {
      name: form.name.trim(),
      ip_address: form.ip_address.trim(),
      robot_key: form.robot_key.trim() || null,
      charging_point: form.charging_point.trim() || null,
      priority: Number(form.priority) || 1,
      task_master_max_active: Number(form.task_master_max_active) || 1,
    }
    if (showAdd) addRobot(data)
    else if (editingId) updateRobot(editingId, data)
    cancel()
  }

  return (
    <div className="h-screen flex flex-col bg-[#f5f5f5]">
      <Navbar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">Robot Library</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{robots.length} of {MAX_ROBOTS} configured.</p>
            </div>
            <button className="text-xs bg-primary text-white rounded px-3 py-1.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed" disabled={atCap} onClick={startAdd} title={atCap ? `Max ${MAX_ROBOTS} robots` : 'Add robot'}>+ Add Robot</button>
          </div>

          {(showAdd || editingId) && (
            <form onSubmit={submit} className="bg-white border rounded-lg p-4 mb-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <Field label="Name *"><input required className="inp" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Robot-3" /></Field>
              <Field label="IP Address *"><input required className="inp" value={form.ip_address} onChange={e => setForm({ ...form, ip_address: e.target.value })} placeholder="192.168.1.103" /></Field>
              <Field label="Robot Key"><input className="inp" value={form.robot_key} onChange={e => setForm({ ...form, robot_key: e.target.value })} placeholder="optional" /></Field>
              <Field label="Charging Point"><input className="inp" value={form.charging_point} onChange={e => setForm({ ...form, charging_point: e.target.value })} placeholder="e.g. CP1" /></Field>
              <Field label="Priority"><input type="number" min={1} className="inp" value={form.priority} onChange={e => setForm({ ...form, priority: Number(e.target.value) })} /></Field>
              <Field label="Max Active Tasks"><input type="number" min={1} className="inp" value={form.task_master_max_active} onChange={e => setForm({ ...form, task_master_max_active: Number(e.target.value) })} /></Field>
              <div className="col-span-2 md:col-span-3 flex gap-2 justify-end">
                <button type="button" className="text-xs border rounded px-3 py-1.5" onClick={cancel}>Cancel</button>
                <button type="submit" className="text-xs bg-primary text-white rounded px-3 py-1.5 font-semibold">{showAdd ? 'Add Robot' : 'Save Changes'}</button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">IP Address</th>
                <th className="px-4 py-3 text-left font-medium">Charging Point</th>
                <th className="px-4 py-3 text-left font-medium">Priority</th>
                <th className="px-4 py-3 text-left font-medium">Max Active</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {robots.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No robots. Add one to get started.</td></tr>}
                {robots.map(r => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{r.ip_address}</td>
                    <td className="px-4 py-3">{r.charging_point ?? '—'}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{r.priority}</span></td>
                    <td className="px-4 py-3">{r.task_master_max_active}</td>
                    <td className="px-4 py-3 text-right">
                      {confirmRemove === r.id ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="text-xs text-red-700">Delete?</span>
                          <button className="text-xs bg-red-600 text-white rounded px-2 py-1" onClick={() => { removeRobot(r.id); setConfirmRemove(null) }}>Yes</button>
                          <button className="text-xs border rounded px-2 py-1" onClick={() => setConfirmRemove(null)}>No</button>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <button className="text-xs border rounded px-2 py-1" onClick={() => startEdit(r)}>Edit</button>
                          <button className="text-xs border border-red-300 text-red-700 rounded px-2 py-1" onClick={() => setConfirmRemove(r.id)}>Remove</button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`.inp{width:100%;border:1px solid #d1d5db;border-radius:4px;padding:6px 8px;font-size:12px;background:#fff}.inp:focus{outline:2px solid #3b82f6;outline-offset:-1px}`}</style>
    </div>
  )
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
    {children}
  </label>
)

function nextIp(robots: ReturnType<typeof getRobots>): string {
  const used = new Set(robots.map(r => r.ip_address))
  for (let i = 101; i < 255; i++) { const ip = `192.168.1.${i}`; if (!used.has(ip)) return ip }
  return '192.168.1.250'
}
