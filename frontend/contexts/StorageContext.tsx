import React, { createContext, useContext, useCallback, useMemo, useRef } from 'react'
import { ITrolley, ITrolleyAssignment, ETrolleyType } from '../MapStage/types'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { SEED_TROLLEYS, SEED_ROBOTS, SEED_TASKS, SEED_AUTOMATION_RULES, SEED_DOOR_CONFIGS, SEED_SETTINGS, DEFAULT_ROBOT_LOCATIONS, RobotLocation } from '../data/seed'

export interface Robot {
  id: string; name: string; ip_address: string; robot_key: string | null
  charging_point: string | null; priority: number; task_master_max_active: number
  carried_trolley_id: number | null; created_at: string
}
export interface Task { id: number; name: string; type: string; api_path: string; payload: string | null; created_at: string }
export interface TaskQueue { id: number; robot_ip: string; task_type: 'single' | 'sequence'; task_id?: number; task_sequence_id?: number; status: string; priority: number; order_index: number; created_at: string }
export interface AutomationRule { id: number; name: string; description?: string; enabled: boolean; trigger_type: string; trigger_config: string; action_type: string; action_config: string; created_at: string }
export interface AutomationExecution { id: number; rule_id: number; status: string; triggered_by: string; context?: string; result?: string; error_message?: string; started_at: string }
export interface DoorConfig { id: number; floor: number | null; area: string | null; reader_name: string; extension_id: string; created_at: string }
export interface TaskMasterAssignment { id: number; status: string; source: string; task_type: string; task_id?: number; task_sequence_id?: number; robot_assignment_mode: string; requested_robot_ip?: string; assigned_robot_ip?: string; queue_id?: number; source_ap_id?: string; dest_ap_id?: string; created_at: string }

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

interface Store {
  trolleyAssignments: Record<string, ITrolleyAssignment | null>
  trolleyRegistry: ITrolley[]
  robots: Robot[]
  robotLocations: Record<string, { current_station: string | null; map_name: string | null; x: number; y: number; angle: number }>
  tasks: Task[]
  taskQueues: TaskQueue[]
  automationRules: AutomationRule[]
  automationExecutions: AutomationExecution[]
  doorConfigs: DoorConfig[]
  settings: Record<string, string>
  taskMasterAssignments: TaskMasterAssignment[]
  _nextId: number
}

const STORAGE_KEY = 'hotel-linen-ops:store'

function initStore(): Store {
  const assignments: Record<string, ITrolleyAssignment | null> = {}
  SEED_TROLLEYS.forEach((t, i) => {
    if (i < 8) {
      const apId = `AP${i + 1}`
      assignments[apId] = { trolley: t, placedAt: new Date().toISOString() }
    }
  })
  return {
    trolleyAssignments: assignments,
    trolleyRegistry: SEED_TROLLEYS,
    robots: SEED_ROBOTS,
    robotLocations: { ...DEFAULT_ROBOT_LOCATIONS },
    tasks: SEED_TASKS,
    taskQueues: [],
    automationRules: SEED_AUTOMATION_RULES,
    automationExecutions: [],
    doorConfigs: SEED_DOOR_CONFIGS,
    settings: SEED_SETTINGS,
    taskMasterAssignments: [],
    _nextId: 100,
  }
}

function normalizeTrolleyState(store: Store) {
  const assignmentMap: Record<string, ITrolleyAssignment | null> = {}
  for (const [apId, a] of Object.entries(store.trolleyAssignments)) {
    assignmentMap[apId] = a ? { trolley: { ...a.trolley }, placedAt: a.placedAt } : null
  }
  return { registry: [...store.trolleyRegistry], assignmentMap }
}

interface StorageCtx {
  store: Store
  getTrolleyState: () => { registry: ITrolley[]; assignmentMap: Record<string, ITrolleyAssignment | null> }
  assignTrolley: (apId: string, trolleyId: number) => void
  removeTrolley: (apId: string) => void
  moveTrolley: (fromApId: string, toApId: string) => void
  executeMove: (fromApId: string, toApId: string, robotIp: string) => Promise<void>
  queueMove: (fromApId: string, toApId: string, robotIp: string) => void
  runTaskQueue: (robotIp: string) => Promise<void>
  cancelQueue: (id: number) => void
  clearRobotQueue: (robotIp: string) => void
  updateRobotLocation: (robotIp: string, station: string) => void
  updateTrolleyType: (id: number, type: ETrolleyType) => void
  getAvailableTrolleys: () => ITrolley[]
  getRobots: () => Robot[]
  getRobotLocation: (ip: string) => RobotLocation | null
  getTasks: () => Task[]
  getQueues: (robotIp?: string) => TaskQueue[]
  automationRules: AutomationRule[]
  doorConfigs: DoorConfig[]
  updateDoorConfig: (id: number, data: { floor?: number | null; area?: string | null }) => void
  updateSetting: (name: string, value: string) => void
  getSetting: (name: string) => string | undefined
  addAutomationExecution: (ruleId: number, status: string) => void
  isProcessing: boolean
}

const Ctx = createContext<StorageCtx | null>(null)

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useLocalStorage<Store>(STORAGE_KEY, initStore())
  const isProcessingRef = useRef(false)

  const getTrolleyState = useCallback(() => normalizeTrolleyState(store), [store])

  const assignTrolley = useCallback((apId: string, trolleyId: number) => {
    setStore(prev => {
      const trolley = prev.trolleyRegistry.find(t => t.id === trolleyId)
      if (!trolley) return prev
      const assignments = { ...prev.trolleyAssignments }
      // Remove from old location
      for (const [k, v] of Object.entries(assignments)) {
        if (v && v.trolley.id === trolleyId) assignments[k] = null
      }
      assignments[apId] = { trolley: { ...trolley }, placedAt: new Date().toISOString() }
      return { ...prev, trolleyAssignments: assignments }
    })
  }, [setStore])

  const removeTrolley = useCallback((apId: string) => {
    setStore(prev => ({ ...prev, trolleyAssignments: { ...prev.trolleyAssignments, [apId]: null } }))
  }, [setStore])

  const moveTrolley = useCallback((from: string, to: string) => {
    setStore(prev => {
      const assignment = prev.trolleyAssignments[from]
      if (!assignment) return prev
      return {
        ...prev,
        trolleyAssignments: { ...prev.trolleyAssignments, [from]: null, [to]: { ...assignment, placedAt: new Date().toISOString() } },
      }
    })
  }, [setStore])

  const executeMove = useCallback(async (from: string, to: string, robotIp: string) => {
    isProcessingRef.current = true
    await sleep(2500)
    setStore(prev => {
      const assignment = prev.trolleyAssignments[from]
      if (!assignment) { isProcessingRef.current = false; return prev }
      return {
        ...prev,
        trolleyAssignments: { ...prev.trolleyAssignments, [from]: null, [to]: { ...assignment, placedAt: new Date().toISOString() } },
        robotLocations: { ...prev.robotLocations, [robotIp]: { current_station: to, map_name: 'basement', x: 0, y: 0, angle: 0 } },
      }
    })
    isProcessingRef.current = false
  }, [setStore])

  const queueMove = useCallback((from: string, to: string, robotIp: string) => {
    setStore(prev => {
      const id = prev._nextId
      const q: TaskQueue = { id, robot_ip: robotIp, task_type: 'single', task_id: 3, status: 'queued', priority: 1, order_index: prev.taskQueues.filter(q => q.robot_ip === robotIp).length + 1, created_at: new Date().toISOString() }
      return { ...prev, taskQueues: [...prev.taskQueues, q], _nextId: id + 1 }
    })
  }, [setStore])

  const runTaskQueue = useCallback(async (robotIp: string) => {
    isProcessingRef.current = true
    const queues = store.taskQueues.filter(q => q.robot_ip === robotIp && q.status === 'queued')
    for (const q of queues) {
      setStore(prev => ({ ...prev, taskQueues: prev.taskQueues.map(qq => qq.id === q.id ? { ...qq, status: 'running' } : qq) }))
      await sleep(2000)
      setStore(prev => ({ ...prev, taskQueues: prev.taskQueues.map(qq => qq.id === q.id ? { ...qq, status: 'completed' } : qq) }))
    }
    isProcessingRef.current = false
  }, [store.taskQueues, setStore])

  const cancelQueue = useCallback((id: number) => {
    setStore(prev => ({ ...prev, taskQueues: prev.taskQueues.map(q => q.id === id ? { ...q, status: 'cancelled' } : q) }))
  }, [setStore])

  const clearRobotQueue = useCallback((robotIp: string) => {
    setStore(prev => ({ ...prev, taskQueues: prev.taskQueues.filter(q => q.robot_ip !== robotIp || q.status !== 'queued') }))
  }, [setStore])

  const updateTrolleyType = useCallback((id: number, type: ETrolleyType) => {
    setStore(prev => ({
      ...prev,
      trolleyRegistry: prev.trolleyRegistry.map(t => t.id === id ? { ...t, type } : t),
      trolleyAssignments: Object.fromEntries(Object.entries(prev.trolleyAssignments).map(([k, v]) =>
        v && v.trolley.id === id ? [k, { ...v, trolley: { ...v.trolley, type } }] : [k, v]
      )),
    }))
  }, [setStore])

  const updateRobotLocation = useCallback((robotIp: string, station: string) => {
    setStore(prev => ({ ...prev, robotLocations: { ...prev.robotLocations, [robotIp]: { current_station: station, map_name: 'basement', x: 0, y: 0, angle: 0 } } }))
  }, [setStore])

  const getAvailableTrolleys = useCallback(() => {
    const assignedIds = new Set(Object.values(store.trolleyAssignments).filter(Boolean).map(a => a!.trolley.id))
    return store.trolleyRegistry.filter(t => !assignedIds.has(t.id))
  }, [store])

  const getRobots = useCallback(() => store.robots, [store.robots])
  const getRobotLocation = useCallback((ip: string) => store.robotLocations[ip] ?? null, [store.robotLocations])
  const getTasks = useCallback(() => store.tasks, [store.tasks])
  const getQueues = useCallback((robotIp?: string) => robotIp ? store.taskQueues.filter(q => q.robot_ip === robotIp) : store.taskQueues, [store.taskQueues])

  const updateDoorConfig = useCallback((id: number, data: { floor?: number | null; area?: string | null }) => {
    setStore(prev => ({ ...prev, doorConfigs: prev.doorConfigs.map(d => d.id === id ? { ...d, ...data } : d) }))
  }, [setStore])

  const updateSetting = useCallback((name: string, value: string) => {
    setStore(prev => ({ ...prev, settings: { ...prev.settings, [name]: value } }))
  }, [setStore])
  const getSetting = useCallback((name: string) => store.settings[name], [store.settings])

  const addAutomationExecution = useCallback((ruleId: number, status: string) => {
    setStore(prev => {
      const id = prev._nextId
      return { ...prev, automationExecutions: [...prev.automationExecutions, { id, rule_id: ruleId, status, triggered_by: 'manual', started_at: new Date().toISOString() }], _nextId: id + 1 }
    })
  }, [setStore])

  const val = useMemo<StorageCtx>(() => ({
    store, getTrolleyState, assignTrolley, removeTrolley, moveTrolley, executeMove,
    queueMove, runTaskQueue, cancelQueue, clearRobotQueue, updateRobotLocation,
    updateTrolleyType, getAvailableTrolleys, getRobots, getRobotLocation,
    getTasks, getQueues,
    automationRules: store.automationRules,
    doorConfigs: store.doorConfigs,
    updateDoorConfig, updateSetting, getSetting, addAutomationExecution,
    isProcessing: isProcessingRef.current,
  }), [store, getTrolleyState, assignTrolley, removeTrolley, moveTrolley, executeMove, queueMove, runTaskQueue, cancelQueue, clearRobotQueue, updateRobotLocation, updateTrolleyType, getAvailableTrolleys, getRobots, getRobotLocation, getTasks, getQueues, updateDoorConfig, updateSetting, getSetting, addAutomationExecution])

  return <Ctx.Provider value={val}>{children}</Ctx.Provider>
}

export function useStorage(): StorageCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStorage must be used within StorageProvider')
  return ctx
}
