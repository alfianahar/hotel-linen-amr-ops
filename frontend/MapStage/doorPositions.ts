export interface IDoorFixedPosition { x: number; y: number }

const POSITIONS: Record<string, IDoorFixedPosition> = {
  '0:Dispatch': { x: 10, y: 0 },
  '0:Corridor': { x: 300, y: 0 },
  '0:Storage': { x: 460, y: 0 },
  '0:DirtyLinenArea': { x: 990, y: 230 },
  '1:DirtyLinenArea': { x: 100, y: 150 },
  '1:Corridor': { x: 300, y: 150 },
  '2:DirtyLinenArea': { x: 300, y: 180 },
  '3:DirtyLinenArea': { x: 300, y: 180 },
  '4:DirtyLinenArea': { x: 300, y: 180 },
  '5:DirtyLinenArea': { x: 300, y: 180 },
  '6:DirtyLinenArea': { x: 300, y: 180 },
  '7:DirtyLinenArea': { x: 300, y: 180 },
  '8:DirtyLinenArea': { x: 300, y: 180 },
}

export function getDoorFixedPosition(floor: number, area: string): IDoorFixedPosition | null {
  return POSITIONS[`${floor}:${area}`] ?? null
}
