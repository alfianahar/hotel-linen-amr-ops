import { IMapConfig, IPosition, IPose, EBoxType, IAPBox, ICPBox, ISpecialLMBox, TMapBox } from './types'
import { SPECIAL_LM_CONFIG } from './constants'

type SpecialLmId = keyof typeof SPECIAL_LM_CONFIG

export function worldToPixel(worldPos: IPosition, config: IMapConfig): { x: number; y: number } {
  const scale = config.scale || 1
  return {
    x: (worldPos.x - config.origin.x) / config.resolution * scale,
    y: config.height - ((worldPos.y - config.origin.y) / config.resolution * scale),
  }
}

export function pixelToWorld(pixelPos: { x: number; y: number }, config: IMapConfig): IPosition {
  const scale = config.scale || 1
  return {
    x: (pixelPos.x / scale) * config.resolution + config.origin.x,
    y: ((config.height - pixelPos.y) / scale) * config.resolution + config.origin.y,
  }
}

export function quaternionToYaw(q: { x: number; y: number; z: number; w: number }): number {
  const siny_cosp = 2 * (q.w * q.z + q.x * q.y)
  const cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z)
  return (Math.atan2(siny_cosp, cosy_cosp) * 180) / Math.PI
}

export function yawToQuaternion(yawDegrees: number): { x: number; y: number; z: number; w: number } {
  const yawRadians = (yawDegrees * Math.PI) / 180
  return { x: 0, y: 0, z: Math.sin(yawRadians / 2), w: Math.cos(yawRadians / 2) }
}

export function isSpecialLM(lmId: string): lmId is SpecialLmId {
  return Object.prototype.hasOwnProperty.call(SPECIAL_LM_CONFIG, lmId)
}

export function parseBoxType(id: string): EBoxType | null {
  if (id.startsWith('AP')) return EBoxType.AP
  if (id.startsWith('CP')) return EBoxType.CP
  if (isSpecialLM(id)) return SPECIAL_LM_CONFIG[id].type
  return null
}

export function distance(p1: IPosition, p2: IPosition): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
}
