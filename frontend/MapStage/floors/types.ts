import { IMapConfig, IMapRegion, TMapBox } from '../types'

export interface IFloorConfig {
  id: string
  label: string
  shortLabel: string
  mapConfig: IMapConfig
  boxes: TMapBox[]
  regions?: IMapRegion[]
}
