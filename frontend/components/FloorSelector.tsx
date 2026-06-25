import { IFloorConfig } from '../MapStage/floors'

interface Props {
  floors: IFloorConfig[]
  selectedFloorId: string
  onFloorChange: (id: string) => void
}

export default function FloorSelector({ floors, selectedFloorId, onFloorChange }: Props) {
  return (
    <div className="flex items-center gap-1 bg-white/90 rounded-lg border shadow-sm px-2 py-1.5">
      {floors.map(f => (
        <button
          key={f.id}
          onClick={() => onFloorChange(f.id)}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            f.id === selectedFloorId
              ? 'bg-primary text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {f.shortLabel}
        </button>
      ))}
    </div>
  )
}
