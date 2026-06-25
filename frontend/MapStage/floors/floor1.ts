import { IFloorConfig } from './types'
import { EBoxType, IAPBox, IMapConfig, ISpecialLMBox, TMapBox } from '../types'
import { EParkingArea } from '../types'

const mapConfig: IMapConfig = { width: 950, height: 340, resolution: 0.01, origin: { x: 0, y: 0 }, scale: 1 }

const boxes: TMapBox[] = [
  { id: 'E1', type: EBoxType.ELEVATOR, label: 'E1', lmId: 'E1', description: 'Elevator',
    pose: { position: { x: 470, y: 80 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 1, area: EParkingArea.EElevator } as ISpecialLMBox,
  { id: 'E2', type: EBoxType.ELEVATOR, label: 'E2', lmId: 'E2', description: 'Elevator',
    pose: { position: { x: 470, y: 150 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 1, area: EParkingArea.EMain } as ISpecialLMBox,
  { id: 'AP101', type: EBoxType.AP, label: '1A', pose: { position: { x: 30, y: 150 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 1, area: EParkingArea.EChute } as IAPBox,
  { id: 'LM104', type: EBoxType.CHUTE, label: 'Chute', lmId: 'LM104', description: 'Chute',
    pose: { position: { x: 170, y: 150 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 1, area: 'Corridor' } as ISpecialLMBox,
  { id: 'AP102', type: EBoxType.AP, label: '1B', pose: { position: { x: 170, y: 220 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 1, area: 'Corridor' } as IAPBox,
]

export const floor1: IFloorConfig = {
  id: 'floor-1', label: 'Floor 1', shortLabel: '1', mapConfig, boxes,
  regions: [{ id: 'f1-elevator', label: 'Elevator', rect: { x: 420, y: 25, width: 110, height: 90 }, fillColor: 'rgba(255, 159, 64, 0.14)', borderColor: 'rgba(230, 92, 0, 0.85)', labelColor: '#e65100' }],
}
