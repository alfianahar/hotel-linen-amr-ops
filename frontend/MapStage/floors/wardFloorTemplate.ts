import { IFloorConfig } from './types'
import { EBoxType, IAPBox, IMapConfig, ISpecialLMBox, TMapBox } from '../types'

const WARD_CONFIG: IMapConfig = { width: 950, height: 340, resolution: 0.01, origin: { x: 0, y: 0 }, scale: 1 }

export interface IWardFloorParams { floorNumber: number }

export function createWardFloorConfig(p: IWardFloorParams): IFloorConfig {
  const f = p.floorNumber
  const boxes: TMapBox[] = [
    { id: `E${f}1`, type: EBoxType.ELEVATOR, label: `E${f}1`, lmId: `E${f}1`, description: 'Elevator', pose: { position: { x: 470, y: 80 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: f, area: 'Elevator' } as ISpecialLMBox,
    { id: `E${f}2`, type: EBoxType.ELEVATOR, label: `E${f}2`, lmId: `E${f}2`, description: 'Elevator', pose: { position: { x: 470, y: 140 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: f, area: 'Elevator' } as ISpecialLMBox,
    { id: `C${f}`, type: EBoxType.CHUTE, label: `C${f}`, lmId: `C${f}`, description: 'Dirty Linen', pose: { position: { x: 300, y: 140 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: f, area: 'DirtyLinenArea' } as ISpecialLMBox,
    { id: `AP${f}01`, type: EBoxType.AP, label: `F${f}A`, pose: { position: { x: 300, y: 220 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: f, area: 'DirtyLinenArea' } as IAPBox,
    { id: `AP${f}02`, type: EBoxType.AP, label: `F${f}B`, pose: { position: { x: 380, y: 140 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: f, area: 'Main' } as IAPBox,
  ]
  return {
    id: `floor-${f}`, label: `Floor ${f}`, shortLabel: String(f), mapConfig: { ...WARD_CONFIG }, boxes,
    regions: [{ id: `f${f}-elevator`, label: 'Elevator', rect: { x: 420, y: 25, width: 110, height: 90 }, fillColor: 'rgba(255, 159, 64, 0.14)', borderColor: 'rgba(230, 92, 0, 0.85)', labelColor: '#e65100' }],
  }
}

export const WARD_FLOOR_PARAMS: IWardFloorParams[] = [
  { floorNumber: 2 }, { floorNumber: 3 }, { floorNumber: 4 }, { floorNumber: 5 },
  { floorNumber: 6 }, { floorNumber: 7 }, { floorNumber: 8 },
]
