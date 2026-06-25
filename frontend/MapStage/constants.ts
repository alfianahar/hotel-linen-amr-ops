import { EBoxState, EBoxType, ETrolleyType, ITrolley } from './types'

export const BOX_DIMENSIONS = { width: 60, height: 40, borderRadius: 4, borderWidth: 2 }

export const BOX_TYPE_COLORS: Record<EBoxType, string> = {
  [EBoxType.AP]: '#90EE90',
  [EBoxType.CP]: '#FFB07C',
  [EBoxType.ELEVATOR]: '#87CEEB',
  [EBoxType.CHUTE]: '#DDA0DD',
  [EBoxType.STORAGE]: '#FFD700',
  [EBoxType.DISPATCH]: '#5EEAD4',
  [EBoxType.RFID_KABINET]: '#FF69B4',
  [EBoxType.DOOR]: '#FBBF24',
}

export const BOX_STATE_BORDERS: Record<EBoxState, string> = {
  [EBoxState.IDLE]: '#333333',
  [EBoxState.ACTIVE]: '#00AA00',
  [EBoxState.SELECTED]: '#B41AEA',
  [EBoxState.DISABLED]: '#999999',
  [EBoxState.ERROR]: '#FF0000',
}

export const BOX_STATE_OVERLAY: Record<EBoxState, string> = {
  [EBoxState.IDLE]: 'transparent',
  [EBoxState.ACTIVE]: 'rgba(0, 170, 0, 0.2)',
  [EBoxState.SELECTED]: 'rgba(180, 26, 234, 0.2)',
  [EBoxState.DISABLED]: 'rgba(150, 150, 150, 0.4)',
  [EBoxState.ERROR]: 'rgba(255, 0, 0, 0.2)',
}

export const MAP_SETTINGS = {
  backgroundColor: '#F5F5F5',
  gridColor: '#E0E0E0',
  originColor: '#FF0000',
  waypointColor: '#FF6B6B',
  waypointRadius: 6,
}

export const SPECIAL_LM_CONFIG = {
  LM23: { type: EBoxType.ELEVATOR, label: 'Elevator', description: 'Elevator Access Point' },
  LM34: { type: EBoxType.RFID_KABINET, label: 'RFID Cabinet', description: 'RFID Cabinet Access Point' },
  LM14: { type: EBoxType.STORAGE, label: 'Storage Room', description: 'Storage Room Access Point' },
  LM33: { type: EBoxType.DISPATCH, label: 'Dispatch', description: 'Dispatch Room Entry' },
  LM43: { type: EBoxType.DISPATCH, label: 'Dispatch', description: 'Dispatch Room Exit' },
  LM38: { type: EBoxType.CHUTE, label: 'Chute', description: 'Chute Area Access Point' },
} as const

export const TROLLEY_TYPE_COLORS: Record<ETrolleyType, string> = {
  [ETrolleyType.EMPTY_SOILED]: '#f97316',
  [ETrolleyType.FULL_SOILED]: '#ef4444',
  [ETrolleyType.EMPTY_CLEAN]: '#3b82f6',
  [ETrolleyType.FULL_CLEAN]: '#22c55e',
}

export const TROLLEY_TYPE_LABELS: Record<ETrolleyType, string> = {
  [ETrolleyType.EMPTY_SOILED]: 'Empty Soiled',
  [ETrolleyType.FULL_SOILED]: 'Full Soiled',
  [ETrolleyType.EMPTY_CLEAN]: 'Empty Clean',
  [ETrolleyType.FULL_CLEAN]: 'Full Clean',
}

export const TROLLEY_REGISTRY: ITrolley[] = Array.from({ length: 36 }, (_, i) => {
  const id = i + 1
  return {
    id,
    type: id <= 20 || (id >= 29 && id <= 30) ? ETrolleyType.EMPTY_CLEAN : ETrolleyType.EMPTY_SOILED,
  }
})

export const Z_INDEX = { mapBackground: 0, grid: 1, paths: 2, boxes: 3, selectedBox: 4, labels: 5, overlay: 10 }
