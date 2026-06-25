import React, { useState } from 'react'
import { AlertCircle, CheckCircle, Play } from 'lucide-react'
import { ISaltoDoorBox } from '../types'

interface Props {
  door: ISaltoDoorBox
  onOpen: (door: ISaltoDoorBox) => Promise<{ success: boolean; message: string }>
  onClose: () => void
}

const SaltoDoorPanel: React.FC<Props> = ({ door, onOpen, onClose }) => {
  const [isOpening, setIsOpening] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleOpen = async () => {
    setIsOpening(true); setResult(null)
    try {
      const response = await onOpen(door)
      setResult({ type: response.success ? 'success' : 'error', message: response.message })
    } catch (error) {
      setResult({ type: 'error', message: error instanceof Error ? error.message : 'Failed to open door' })
    } finally { setIsOpening(false) }
  }

  return (
    <div className="absolute top-0 right-0 w-[280px] h-full bg-white border-l z-30 flex flex-col overflow-y-auto shadow-lg">
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-gray-50">
        <span className="font-bold text-sm">{door.label}</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl leading-none">&times;</button>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Area</div><span className="text-sm font-semibold">{door.area}</span></div>
        <div><div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Floor</div><span className="text-sm">{door.floor === 0 ? 'Basement' : `Floor ${door.floor}`}</span></div>
        <div>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Readers</div>
          {door.readerNames.map((name, i) => (
            <div key={i} className="flex items-center justify-between gap-2 px-2.5 py-2 rounded border bg-gray-50 mb-1">
              <span className="text-xs font-semibold">{name}</span>
              <span className="text-[10px] text-gray-500 truncate">{door.doorIds[i]}</span>
            </div>
          ))}
        </div>
        {result && (
          <div className={`flex items-center gap-2 text-xs font-semibold p-2.5 rounded border ${result.type === 'success' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}>
            {result.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            <span>{result.message}</span>
          </div>
        )}
        <button onClick={handleOpen} disabled={isOpening} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded text-xs font-bold border-0 transition-opacity disabled:opacity-50" style={{ backgroundColor: isOpening ? '#f3f4f6' : '#f59e0b', color: isOpening ? '#9ca3af' : '#111827' }}>
          <Play size={13} />
          <span>{isOpening ? 'Opening...' : door.doorIds.length > 1 ? 'Open Doors' : 'Open Door'}</span>
        </button>
      </div>
    </div>
  )
}

export default SaltoDoorPanel
