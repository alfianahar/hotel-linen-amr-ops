export enum EBoxType {
  AP = 'AP',
  CP = 'CP',
  ELEVATOR = 'ELEVATOR',
  CHUTE = 'CHUTE',
  STORAGE = 'STORAGE',
  DISPATCH = 'DISPATCH',
  RFID_KABINET = 'RFID_KABINET',
  DOOR = 'DOOR',
}

export enum EParkingArea {
  EDispatch = 'Dispatch',
  EStorage = 'Storage',
  EMain = 'Main',
  EChute = 'ChuteArea',
  EElevator = 'Elevator',
}

export enum EBoxState {
  IDLE = 'IDLE',
  ACTIVE = 'ACTIVE',
  SELECTED = 'SELECTED',
  DISABLED = 'DISABLED',
  ERROR = 'ERROR',
}

export enum ETrolleyType {
  EMPTY_SOILED = 'EMPTY_SOILED',
  FULL_SOILED = 'FULL_SOILED',
  EMPTY_CLEAN = 'EMPTY_CLEAN',
  FULL_CLEAN = 'FULL_CLEAN',
}

export interface ITrolley { id: number; type: ETrolleyType }

export interface ITrolleyAssignment {
  trolley: ITrolley
  placedAt: string
}

export interface IRobotOption {
  ip: string
  name: string
  charging_point?: string | null
  currentStation?: string | null
}

export interface RobotMoveOptions {
  signal?: AbortSignal
  useRecognition?: boolean
}

export const AUTO_ASSIGN_ROBOT_IP = '__auto_assign__'

export interface IPosition { x: number; y: number; z?: number }
export interface IOrientation { x: number; y: number; z: number; w: number }
export interface IPose { position: IPosition; orientation: IOrientation }

export interface IBox {
  id: string
  type: EBoxType
  label: string
  pose: IPose
  state?: EBoxState
  isClickable?: boolean
  row?: number
  col?: number
  area?: string
  floor?: number
}

export interface IAPBox extends IBox { type: EBoxType.AP; linkedTo?: string }
export interface ICPBox extends IBox { type: EBoxType.CP; connectedAPs?: string[] }
export interface ISpecialLMBox extends IBox { type: EBoxType.ELEVATOR | EBoxType.CHUTE | EBoxType.STORAGE | EBoxType.RFID_KABINET | EBoxType.DISPATCH; lmId: string; description: string }
export interface IDoorBox extends IBox { type: EBoxType.DOOR; area: string; floor: number; doorIds: string[]; readerNames: string[] }

export type TMapBox = IAPBox | ICPBox | ISpecialLMBox | IDoorBox

export interface IWaypoint { id: string; label: string; pose: IPose; isNavigable?: boolean }
export interface IPathSegment { id: string; from: string; to: string; color?: string; lineWidth?: number }

export interface IMapConfig {
  width: number
  height: number
  resolution: number
  origin: IPosition
  scale?: number
}

export interface IMapRect { x: number; y: number; width: number; height: number }

export interface IMapRegion {
  id: string
  label: string
  rect: IMapRect
  fillColor: string
  borderColor: string
  labelColor?: string
}

export interface IMapStageProps {
  config: IMapConfig
  boxes: TMapBox[]
  waypoints?: IWaypoint[]
  paths?: IPathSegment[]
  selectedIds?: string[]
  onBoxClick?: (box: TMapBox) => void
  mapImageUrl?: string
  showGrid?: boolean
  showOrigin?: boolean
  showLegend?: boolean
  regions?: IMapRegion[]
  floorLabel?: string
  allFloorAPIds?: string[]
  currentFloorAPIds?: string[]
  trolleyMap?: Record<string, ITrolleyAssignment | null>
  trolleyRegistry?: ITrolley[]
  onTrolleyAssign?: (apId: string, trolleyId: number, area: string, floor: number) => Promise<void> | void
  onTrolleyRemove?: (apId: string) => Promise<void> | void
  onTrolleyMove?: (fromApId: string, toApId: string, sourceArea: string, sourceFloor: number, destArea: string, destFloor: number) => Promise<void> | void
  onUpdateTrolleyType?: (trolleyId: number, type: ETrolleyType) => Promise<void> | void
  robots?: IRobotOption[]
  onExecuteMove?: (fromApId: string, toApId: string, robotIp: string, sourceArea: string, sourceFloor: number, destArea: string, destFloor: number, options?: RobotMoveOptions) => Promise<void>
  onExecuteTargetMove?: (fromApId: string, toApId: string, robotIp: string, sourceArea: string, sourceFloor: number, destArea: string, destFloor: number, options?: { signal?: AbortSignal }) => Promise<void>
  onQueueTargetMove?: (fromApId: string, toApId: string, robotIp: string, sourceArea: string, sourceFloor: number, destArea: string, destFloor: number) => Promise<void>
  onQueueMove?: (fromApId: string, toApId: string, robotIp: string, sourceArea: string, sourceFloor: number, destArea: string, destFloor: number, options?: RobotMoveOptions) => Promise<void>
  onExecuteRfidMove?: (fromApId: string, robotIp: string, sourceArea: string, sourceFloor: number) => Promise<void>
  onQueueRfidMove?: (fromApId: string, robotIp: string, sourceArea: string, sourceFloor: number) => Promise<void>
  onExecuteRfidReturn?: (toApId: string, robotIp: string, destArea: string, destFloor: number) => Promise<void>
  onQueueRfidReturn?: (toApId: string, robotIp: string, destArea: string, destFloor: number) => Promise<void>
  onCancelExecute?: (robotIp: string) => void | Promise<void>
  onCabinetDoorAction?: (action: "OpenDoor" | "CloseDoor") => Promise<void>
}
