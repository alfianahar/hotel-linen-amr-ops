import { ETrolleyType, ITrolley } from '../MapStage/types'

export const SEED_TROLLEYS: ITrolley[] = Array.from({ length: 36 }, (_, i) => ({
  id: i + 1,
  type: i < 20 || (i >= 28 && i < 30) ? ETrolleyType.EMPTY_CLEAN : ETrolleyType.EMPTY_SOILED,
}))

export const SEED_ROBOTS = [
  { id: 'r1', name: 'Robot-1', ip_address: '192.168.1.101', robot_key: null, charging_point: 'CP1', priority: 1, task_master_max_active: 2, carried_trolley_id: null, created_at: new Date().toISOString() },
  { id: 'r2', name: 'Robot-2', ip_address: '192.168.1.102', robot_key: null, charging_point: 'CP2', priority: 2, task_master_max_active: 2, carried_trolley_id: null, created_at: new Date().toISOString() },
  { id: 'r3', name: 'Robot-3', ip_address: '192.168.1.103', robot_key: null, charging_point: null, priority: 3, task_master_max_active: 2, carried_trolley_id: null, created_at: new Date().toISOString() },
  { id: 'r4', name: 'Robot-4', ip_address: '192.168.1.104', robot_key: null, charging_point: null, priority: 4, task_master_max_active: 2, carried_trolley_id: null, created_at: new Date().toISOString() },
  { id: 'r5', name: 'Robot-5', ip_address: '192.168.1.105', robot_key: null, charging_point: null, priority: 5, task_master_max_active: 1, carried_trolley_id: null, created_at: new Date().toISOString() },
  { id: 'r6', name: 'Robot-6', ip_address: '192.168.1.106', robot_key: null, charging_point: null, priority: 6, task_master_max_active: 1, carried_trolley_id: null, created_at: new Date().toISOString() },
]

export const SEED_TASKS = [
  { id: 1, name: 'Open RFID Cabinet', type: 'chute', api_path: 'open', payload: null, created_at: new Date().toISOString() },
  { id: 2, name: 'Close RFID Cabinet', type: 'chute', api_path: 'close', payload: null, created_at: new Date().toISOString() },
  { id: 3, name: 'Move Trolley', type: 'trolley', api_path: 'move_trolley', payload: null, created_at: new Date().toISOString() },
  { id: 4, name: 'Navigate to Station', type: 'seer', api_path: 'navigate', payload: null, created_at: new Date().toISOString() },
  { id: 5, name: 'Charge Robot', type: 'seer', api_path: 'charge', payload: null, created_at: new Date().toISOString() },
  { id: 6, name: 'Open Door', type: 'salto', api_path: 'open_door', payload: null, created_at: new Date().toISOString() },
  { id: 7, name: 'Call Lift', type: 'kone', api_path: 'call_lift', payload: null, created_at: new Date().toISOString() },
]

export const SEED_AUTOMATION_RULES = [
  { id: 1, name: 'Auto-charge when battery low', description: 'Send robot to nearest CP when battery <= 30%', enabled: true, trigger_type: 'condition', trigger_config: '{"field":"battery_level","operator":"lte","value":30}', action_type: 'execute_sequence', action_config: '{"task_sequence_id":1}', created_at: new Date().toISOString() },
]

export const SEED_DOOR_CONFIGS = [
  { id: 1, floor: 0, area: 'Dispatch', reader_name: 'BASEMENT-DISPATCH', extension_id: 'ext-dispatch' },
  { id: 2, floor: 0, area: 'Storage', reader_name: 'BASEMENT-STORAGE', extension_id: 'ext-storage' },
  { id: 3, floor: 0, area: 'ChuteArea', reader_name: 'BASEMENT-CHUTE', extension_id: 'ext-chute' },
  { id: 4, floor: 1, area: 'Corridor', reader_name: 'F1-CORRIDOR', extension_id: 'ext-f1-corridor' },
]

export const SEED_SETTINGS: Record<string, string> = {
  push_interval: '500',
  seer_tcp_enabled: 'false',
}

export interface RobotLocation {
  current_station: string | null
  map_name: string | null
  x: number
  y: number
  angle: number
}

export const DEFAULT_ROBOT_LOCATIONS: Record<string, RobotLocation> = {
  '192.168.1.101': { current_station: 'CP1', map_name: 'basement', x: 620, y: 320, angle: 0 },
  '192.168.1.102': { current_station: 'CP2', map_name: 'basement', x: 760, y: 320, angle: 0 },
  '192.168.1.103': { current_station: 'AP12', map_name: 'basement', x: 620, y: 140, angle: 0 },
  '192.168.1.104': { current_station: 'AP13', map_name: 'basement', x: 700, y: 140, angle: 0 },
  '192.168.1.105': { current_station: 'AP8', map_name: 'basement', x: 600, y: 50, angle: 0 },
  '192.168.1.106': { current_station: 'AP15', map_name: 'basement', x: 600, y: 230, angle: 0 },
}
