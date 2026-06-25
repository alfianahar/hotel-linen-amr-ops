export interface IDoorFixedPosition { x: number; y: number }

const POSITIONS: Record<string, IDoorFixedPosition> = {
  '0:Dispatch': { x: 10, y: 0 },
  '0:Corridor': { x: 300, y: 0 },
  '0:Storage': { x: 460, y: 0 },
  '0:ChuteArea': { x: 990, y: 230 },
  '1:ChuteArea': { x: 100, y: 150 },
  '1:Corridor': { x: 300, y: 150 },
  '2:ChuteArea': { x: 300, y: 180 },
  '3:ChuteArea': { x: 300, y: 180 },
  '4:ChuteArea': { x: 300, y: 180 },
  '5:ChuteArea': { x: 300, y: 180 },
  '6:ChuteArea': { x: 300, y: 180 },
  '7:ChuteArea': { x: 300, y: 180 },
  '8:ChuteArea': { x: 300, y: 180 },
}

export function getDoorFixedPosition(floor: number, area: string): IDoorFixedPosition | null {
  return POSITIONS[`${floor}:${area}`] ?? null
}
