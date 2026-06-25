import { IFloorConfig } from './types'
import { basementMapConfig, basementBoxes, BASEMENT_REGIONS } from '../basementMapData'

export const basementFloor: IFloorConfig = {
  id: 'basement',
  label: 'Basement',
  shortLabel: 'B',
  mapConfig: basementMapConfig,
  boxes: basementBoxes,
  regions: BASEMENT_REGIONS,
}
