export type { IFloorConfig } from './types'
export type { IWardFloorParams } from './wardFloorTemplate'
export { basementFloor } from './basement'
export { floor1 } from './floor1'
export { createWardFloorConfig, WARD_FLOOR_PARAMS } from './wardFloorTemplate'

import { IFloorConfig } from './types'
import { basementFloor } from './basement'
import { floor1 } from './floor1'
import { createWardFloorConfig, WARD_FLOOR_PARAMS } from './wardFloorTemplate'

const wardFloors: IFloorConfig[] = WARD_FLOOR_PARAMS.map(createWardFloorConfig)

export const ALL_FLOORS: IFloorConfig[] = [basementFloor, floor1, ...wardFloors]

export const FLOOR_MAP: Record<string, IFloorConfig> = {}
for (const floor of ALL_FLOORS) FLOOR_MAP[floor.id] = floor

export function getFloorById(id: string): IFloorConfig {
  return FLOOR_MAP[id] ?? basementFloor
}
