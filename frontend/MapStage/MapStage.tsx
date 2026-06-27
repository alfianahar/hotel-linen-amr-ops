import React, { useCallback, useRef, useState, useEffect } from 'react'
import { EBoxType, ETrolleyType, IMapStageProps, IDoorBox, TMapBox } from './types'
import { BOX_TYPE_COLORS, TROLLEY_TYPE_COLORS } from './constants'
import APDetailPanel, { PanelMode } from './components/APDetailPanel'
import DoorPanel from './components/DoorPanel'
import { ALL_FLOORS } from './floors'
import { getDoorFixedPosition } from './doorPositions'

const MIN_ZOOM = 0.3; const MAX_ZOOM = 3.0; const ZOOM_STEP = 0.15; const PINCH_SENSITIVITY = 0.01

const MapStage: React.FC<IMapStageProps> = ({
  config, boxes, selectedIds = [], onBoxClick, mapImageUrl, showLegend = true,
  regions, floorLabel, allFloorAPIds, trolleyMap, trolleyRegistry,
  onTrolleyAssign, onTrolleyRemove, onTrolleyMove, onUpdateTrolleyType,
  robots, onExecuteMove, onExecuteTargetMove, onQueueTargetMove, onQueueMove,
  onExecuteRfidMove, onQueueRfidMove, onExecuteRfidReturn, onQueueRfidReturn,
  onCancelExecute, onCabinetDoorAction,
}) => {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const panStart = useRef({ x: 0, y: 0 })
  const panOrigin = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const lastTouchDist = useRef<number | null>(null)
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null)
  const userZoomed = useRef(false)

  const [panelMode, setPanelMode] = useState<PanelMode | null>(null)
  const [selectedSaltoDoor, setSelectedSaltoDoor] = useState<IDoorBox | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const abortExecutionRef = useRef<(() => void) | null>(null)

  const assignedTrolleyIds = React.useMemo(() => {
    if (!trolleyMap) return new Set<number>()
    const ids = new Set<number>()
    for (const a of Object.values(trolleyMap)) if (a) ids.add(a.trolley.id)
    return ids
  }, [trolleyMap])

  useEffect(() => {
    let isMounted = true
    const loadConfigs = async () => { /* stub: door configs from context later */ }
    loadConfigs()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (!actionError) return
    const id = window.setTimeout(() => setActionError(null), 6000)
    return () => window.clearTimeout(id)
  }, [actionError])

  const showActionError = useCallback((msg: string) => setActionError(msg), [])

  const findBoxById = useCallback((apId: string): { area: string; floor: number } => {
    for (const floor of ALL_FLOORS) {
      const box = floor.boxes.find(b => b.id === apId)
      if (box && 'area' in box && 'floor' in box) return { area: String((box as any).area), floor: Number((box as any).floor) }
    }
    return { area: 'Main', floor: 0 }
  }, [])

  const handleBoxClick = useCallback((box: TMapBox) => {
    const isAP = box.type === EBoxType.AP
    const isTargetOnly = box.type === EBoxType.CP
    const isSaltoDoor = box.type === EBoxType.DOOR
    const isLm = [EBoxType.ELEVATOR, EBoxType.CHUTE, EBoxType.STORAGE, EBoxType.DISPATCH, EBoxType.RFID_KABINET].includes(box.type)
    const isSelectingDest = panelMode?.kind === 'selectDest'
    const isSelectingRfidReturn = panelMode?.kind === 'selectRfidReturnDest'

    if ((isSelectingDest || isSelectingRfidReturn) && isAP && box.id !== panelMode!.sourceApId) {
      const destInfo = 'area' in box && 'floor' in box && box.area != null ? { area: String(box.area), floor: Number(box.floor) } : findBoxById(box.id)
      const sourceInfo = findBoxById(panelMode!.sourceApId)
      if (isSelectingRfidReturn) {
        setPanelMode({ kind: 'confirmRfidReturn', sourceApId: panelMode!.sourceApId, sourceApLabel: panelMode!.sourceApLabel, destApId: box.id, destApLabel: box.label, sourceArea: sourceInfo.area, sourceFloor: sourceInfo.floor, destArea: destInfo.area, destFloor: destInfo.floor, trolley: panelMode!.trolley, allowedRobotIps: [] })
      } else {
        setPanelMode({ kind: 'confirmMove', sourceApId: panelMode!.sourceApId, sourceApLabel: panelMode!.sourceApLabel, destApId: box.id, destApLabel: box.label, sourceArea: sourceInfo.area, sourceFloor: sourceInfo.floor, destArea: destInfo.area, destFloor: destInfo.floor, trolley: panelMode!.trolley })
      }
      return
    }
    if (isAP || isLm || isTargetOnly) { setSelectedSaltoDoor(null); setPanelMode({ kind: 'detail', apId: box.id, apLabel: box.label, stationType: isAP ? 'ap' : isTargetOnly ? 'cp' : 'lm' }); return }
    if (isSaltoDoor) { setPanelMode(null); setSelectedSaltoDoor(box as IDoorBox); return }
    setPanelMode(null); setSelectedSaltoDoor(null)
    if (onBoxClick && box.isClickable !== false) onBoxClick(box)
  }, [onBoxClick, panelMode, findBoxById])

  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (panelRef.current?.contains(e.target as Node)) return
    userZoomed.current = true
    setZoom(p => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, p + (e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP))))
  }, [])
  const zoomIn = useCallback(() => { userZoomed.current = true; setZoom(p => Math.min(MAX_ZOOM, p + ZOOM_STEP)) }, [])
  const zoomOut = useCallback(() => { userZoomed.current = true; setZoom(p => Math.max(MIN_ZOOM, p - ZOOM_STEP)) }, [])
  const resetView = useCallback(() => {
    const c = containerRef.current; if (!c) { setZoom(1); setPan({ x: 0, y: 0 }); userZoomed.current = true; return }
    const cw = c.clientWidth, ch = c.clientHeight
    const fit = Math.min(cw / config.width, ch / config.height) * 0.96
    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, fit)))
    setPan({ x: 0, y: 0 })
    userZoomed.current = true
  }, [config.width, config.height])

  useEffect(() => {
    const el = containerRef.current; if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setContainerSize({ width: e.contentRect.width, height: e.contentRect.height })
    })
    ro.observe(el)
    setContainerSize({ width: el.clientWidth, height: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (userZoomed.current) return
    const w = containerSize.width, h = containerSize.height
    if (w <= 0 || h <= 0) return
    const fit = Math.min(w / config.width, h / config.height) * 0.96
    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, fit)))
  }, [containerSize.width, containerSize.height, config.width, config.height])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsPanning(true); panStart.current = { x: e.clientX, y: e.clientY }; panOrigin.current = { x: pan.x, y: pan.y }
  }, [pan])
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return
    setPan({ x: panOrigin.current.x + e.clientX - panStart.current.x, y: panOrigin.current.y + e.clientY - panStart.current.y })
  }, [isPanning])
  const handleMouseUp = useCallback(() => setIsPanning(false), [])

  const getTouchDist = (t: React.TouchList) => t.length < 2 ? null : Math.sqrt((t[0].clientX - t[1].clientX) ** 2 + (t[0].clientY - t[1].clientY) ** 2)
  const getTouchCenter = (t: React.TouchList) => t.length < 2 ? { x: t[0].clientX, y: t[0].clientY } : { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) { setIsPanning(true); panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; panOrigin.current = { x: pan.x, y: pan.y } }
    else if (e.touches.length === 2) { lastTouchDist.current = getTouchDist(e.touches); lastTouchCenter.current = getTouchCenter(e.touches) }
  }, [pan])
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) setPan({ x: panOrigin.current.x + e.touches[0].clientX - panStart.current.x, y: panOrigin.current.y + e.touches[0].clientY - panStart.current.y })
    else if (e.touches.length === 2) {
      const dist = getTouchDist(e.touches); if (dist !== null && lastTouchDist.current !== null) { setZoom(p => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, p + (dist - lastTouchDist.current) * PINCH_SENSITIVITY))); lastTouchDist.current = dist }
      const center = getTouchCenter(e.touches); if (lastTouchCenter.current) { setZoom(p => p); setPan(prev => ({ x: prev.x + center.x - lastTouchCenter.current!.x, y: prev.y + center.y - lastTouchCenter.current!.y })) }
      lastTouchCenter.current = center
    }
  }, [isPanning])
  const handleTouchEnd = useCallback(() => { setIsPanning(false); lastTouchDist.current = null; lastTouchCenter.current = null }, [])

  useEffect(() => {
    const el = containerRef.current; if (!el) return
    const prevent = (e: WheelEvent) => { if (panelRef.current?.contains(e.target as Node)) return; e.preventDefault() }
    el.addEventListener('wheel', prevent, { passive: false })
    return () => el.removeEventListener('wheel', prevent)
  }, [])

  const computeTrolleyStats = useCallback((apIds: string[]) => {
    let ec = 0, fc = 0, es = 0, fs = 0, none = 0
    for (const id of apIds) {
      const a = trolleyMap?.[id]; if (!a) { none++; continue }
      switch (a.trolley.type) { case ETrolleyType.EMPTY_CLEAN: ec++; break; case ETrolleyType.FULL_CLEAN: fc++; break; case ETrolleyType.EMPTY_SOILED: es++; break; case ETrolleyType.FULL_SOILED: fs++; break }
    }
    return { ec, fc, es, fs, none, total: apIds.length }
  }, [trolleyMap])

  const floorStats = React.useMemo(() => {
    if (!trolleyMap) return null
    const apIds = boxes.filter(b => b.type === EBoxType.AP).map(b => b.id)
    return computeTrolleyStats(apIds)
  }, [trolleyMap, boxes, computeTrolleyStats])

  const allStats = React.useMemo(() => {
    if (!trolleyMap || !allFloorAPIds) return null
    return computeTrolleyStats(allFloorAPIds)
  }, [trolleyMap, allFloorAPIds, computeTrolleyStats])

  const isAnyPanelOpen = Boolean(panelMode || selectedSaltoDoor)

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#f5f5f5]" style={{ touchAction: 'none', userSelect: 'none' }}
      onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {/* Zoom controls */}
      <div className="absolute bottom-2 right-2 z-20 flex flex-col gap-1">
        <button onClick={zoomIn} style={zBtnStyle} title="Zoom In">+</button>
        <button onClick={resetView} style={{ ...zBtnStyle, fontSize: 11, padding: '2px 6px' }} title="Reset">⟲</button>
        <button onClick={zoomOut} style={zBtnStyle} title="Zoom Out">−</button>
        <span className="text-center text-[10px] text-gray-500 bg-white/90 rounded px-1 py-0.5">{Math.round(zoom * 100)}%</span>
      </div>

      {/* Trolley summary — moved to bottom info bar in dashboard; keep lightweight version in map for legacy views */}
      {floorStats && false && (
        <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1 text-[11px] font-semibold bg-white/90 rounded-md px-2 py-1.5 border shadow-sm">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-gray-700 text-[10px] font-bold min-w-[60px]">{floorLabel ?? 'Floor'}</span>
            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full border border-blue-300">● {floorStats.ec} EC</span>
            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full border border-green-300">● {floorStats.fc} FC</span>
            <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full border border-orange-300">● {floorStats.es} ES</span>
            <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full border border-red-300">● {floorStats.fs} FS</span>
            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full border">{floorStats.none} Free</span>
          </div>
          {allStats && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-gray-700 text-[10px] font-bold min-w-[60px]">All floors</span>
              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full border border-blue-300">● {allStats.ec}</span>
              <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full border border-green-300">● {allStats.fc}</span>
              <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full border border-orange-300">● {allStats.es}</span>
              <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full border border-red-300">● {allStats.fs}</span>
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full border">{allStats.none}</span>
            </div>
          )}
        </div>
      )}

      {/* Canvas - fixed-size map div centered in the container */}
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: config.width, height: config.height, marginLeft: -config.width / 2, marginTop: -config.height / 2, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center', cursor: isPanning ? 'grabbing' : 'grab', willChange: 'transform' }}>
        {mapImageUrl && <img src={mapImageUrl} alt="Map" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />}
        {regions?.map(r => (
          <div key={r.id} style={{ position: 'absolute', left: r.rect.x, top: r.rect.y, width: r.rect.width, height: r.rect.height, backgroundColor: r.fillColor, border: `2px dashed ${r.borderColor}`, borderRadius: 10, pointerEvents: 'none', zIndex: 1 }}>
            <div style={{ position: 'absolute', bottom: 6, right: 6, fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.9)', backgroundColor: r.labelColor, border: `1px solid ${r.borderColor}`, padding: '2px 8px', borderRadius: 999 }}>{r.label}</div>
          </div>
        ))}
        {boxes.map(box => {
          const bg = BOX_TYPE_COLORS[box.type]; const sel = isSelected(box.id)
          const x = box.pose.position.x; const y = box.pose.position.y
          const isAP = box.type === EBoxType.AP
          const isSaltoDoor = box.type === EBoxType.DOOR
          const supportsTrolley = isAP || box.id === 'LM34'
          const assignment = supportsTrolley && trolleyMap ? trolleyMap[box.id] ?? null : null
          const tColor = assignment ? TROLLEY_TYPE_COLORS[assignment.trolley.type] : null
          const isSelectingDest = panelMode?.kind === 'selectDest' || panelMode?.kind === 'selectRfidReturnDest'
          const isMoveSource = isSelectingDest && panelMode!.sourceApId === box.id
          const isMoveTarget = isSelectingDest && isAP && box.id !== panelMode!.sourceApId
          const w = isSaltoDoor ? 68 : 48; const h = isSaltoDoor ? 28 : 40

          return (
            <div key={box.id} onClick={e => { e.stopPropagation(); handleBoxClick(box) }} title={box.label}
              style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: w, height: h, borderRadius: 4, border: `${assignment ? 2.5 : isSaltoDoor ? 2.5 : 2}px solid ${sel ? '#B41AEA' : tColor ?? (isSaltoDoor ? '#b45309' : '#333')}`, backgroundColor: assignment ? darken(bg, 0.1) : bg, cursor: box.isClickable !== false ? 'pointer' : 'default', boxShadow: isMoveSource ? '0 0 0 3px rgba(59,130,246,0.5)' : sel ? '0 0 0 2px rgba(180,26,234,0.3)' : 'none', zIndex: isMoveSource ? 5 : 3 }}>
              <span className="text-[10px] font-bold font-sans text-gray-800 select-none text-center leading-tight" style={{ maxWidth: isSaltoDoor ? 60 : 40, fontSize: isSaltoDoor ? 8.5 : 10 }}>{box.label}</span>
              {supportsTrolley && assignment && (
                <span style={{ position: 'absolute', bottom: -1, right: -1, minWidth: 16, height: 14, borderRadius: '2px 0 3px 0', backgroundColor: TROLLEY_TYPE_COLORS[assignment.trolley.type], color: '#fff', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', lineHeight: 1, zIndex: 6 }}>{assignment.trolley.id}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="absolute left-2 bottom-2 bg-white/95 border rounded-md px-2.5 py-1 z-15 text-[10px] shadow-sm">
          <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 items-center">
            <LegendItem color={BOX_TYPE_COLORS[EBoxType.AP]} label="Parking" />
            <LegendItem color={BOX_TYPE_COLORS[EBoxType.CP]} label="Charging" />
            <LegendItem color={BOX_TYPE_COLORS[EBoxType.ELEVATOR]} label="Elevator" />
            <LegendItem color={BOX_TYPE_COLORS[EBoxType.DISPATCH]} label="Dispatch" />
            <LegendItem color={BOX_TYPE_COLORS[EBoxType.CHUTE]} label="Dirty Linen" />
            <span className="w-px h-3 bg-gray-300" />
            <TLegend color={TROLLEY_TYPE_COLORS[ETrolleyType.EMPTY_CLEAN]} label="Empty Clean" />
            <TLegend color={TROLLEY_TYPE_COLORS[ETrolleyType.FULL_CLEAN]} label="Full Clean" />
            <TLegend color={TROLLEY_TYPE_COLORS[ETrolleyType.EMPTY_SOILED]} label="Empty Soiled" />
            <TLegend color={TROLLEY_TYPE_COLORS[ETrolleyType.FULL_SOILED]} label="Full Soiled" />
          </div>
        </div>
      )}

      {/* Panels */}
      {panelMode && (
        <div ref={panelRef}>
          <APDetailPanel
            mode={panelMode}
            assignment={panelMode.kind === 'detail' && trolleyMap ? trolleyMap[panelMode.apId] ?? null : null}
            assignedTrolleyIds={assignedTrolleyIds}
            trolleyRegistry={trolleyRegistry ?? []}
            boxType={panelMode.kind === 'detail' ? boxes.find(b => b.id === panelMode.apId)?.type : undefined}
            onAssignTrolley={(apId, trolleyId) => { const b = findBoxById(apId); onTrolleyAssign?.(apId, trolleyId, b.area, b.floor) }}
            onRemoveTrolley={apId => onTrolleyRemove?.(apId)}
            onUpdateTrolleyType={(id, type) => onUpdateTrolleyType?.(id, type)}
            onStartMove={() => {
              if (panelMode.kind !== 'detail') return
              const a = trolleyMap?.[panelMode.apId]; if (!a) return
              const b = findBoxById(panelMode.apId)
              setPanelMode({ kind: 'selectDest', sourceApId: panelMode.apId, sourceApLabel: panelMode.apLabel, trolley: a.trolley, sourceArea: b.area, sourceFloor: b.floor })
            }}
            onStartTargetMove={() => {
              if (panelMode.kind !== 'detail') return
              const b = findBoxById(panelMode.apId)
              setPanelMode({ kind: 'confirmTargetMove', sourceApId: panelMode.apId, sourceApLabel: panelMode.apLabel, sourceArea: b.area, sourceFloor: b.floor, destApId: panelMode.apId, destApLabel: panelMode.apLabel, destArea: b.area, destFloor: b.floor, destStationType: panelMode.stationType })
            }}
            onConfirmMove={async (from, to) => {
              if (panelMode.kind !== 'confirmMove') return
              const src = findBoxById(from); const dst = findBoxById(to)
              await onTrolleyMove?.(from, to, src.area, src.floor, dst.area, dst.floor)
              setPanelMode(null)
            }}
            robots={robots ?? []}
            onExecuteMove={onExecuteMove}
            onExecuteTargetMove={onExecuteTargetMove}
            onQueueTargetMove={onQueueTargetMove}
            onQueueMove={onQueueMove}
            onExecuteRfidMove={onExecuteRfidMove}
            onQueueRfidMove={onQueueRfidMove}
            onExecuteRfidReturn={onExecuteRfidReturn}
            onQueueRfidReturn={onQueueRfidReturn}
            onCancelExecute={onCancelExecute}
            onCabinetDoorAction={onCabinetDoorAction}
            onCallLift={async (_elevatorId, floor) => { await new Promise(r => setTimeout(r, 1500)) }}
            onActionError={showActionError}
            onCancelMove={() => {
              if ([/* any dest selection mode */].includes(panelMode.kind)) {
                setPanelMode({ kind: 'detail', apId: panelMode.sourceApId, apLabel: panelMode.sourceApLabel, stationType: 'ap' })
              } else setPanelMode(null)
            }}
            onClose={() => { setPanelMode(null) }}
            abortRef={abortExecutionRef}
          />
        </div>
      )}

      {selectedSaltoDoor && (
        <div ref={panelRef}>
          <DoorPanel door={selectedSaltoDoor} onOpen={async () => ({ success: true, message: 'Door opened' })} onClose={() => setSelectedSaltoDoor(null)} />
        </div>
      )}

      {actionError && (
        <div role="alert" className="fixed right-6 bottom-6 z-[1000] w-[360px] p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-800 shadow-lg">
          <div className="flex gap-2.5 items-start">
            <div className="flex-1"><div className="text-xs font-bold mb-1">Action failed</div><div className="text-xs leading-relaxed">{actionError}</div></div>
            <button onClick={() => setActionError(null)} className="text-red-800 text-lg leading-none bg-transparent border-0 cursor-pointer p-0">&times;</button>
          </div>
        </div>
      )}
    </div>
  )
}

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-1.5"><div style={{ width: 18, height: 14, borderRadius: 3, border: '1px solid #9ca3af', backgroundColor: color }} /><span>{label}</span></div>
)
const TLegend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-1.5"><div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: color }} /><span>{label}</span></div>
)
const zBtnStyle: React.CSSProperties = { width: 30, height: 30, borderRadius: 4, border: '1px solid #d1d5db', backgroundColor: 'rgba(255,255,255,0.95)', cursor: 'pointer', fontSize: 16, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }

function darken(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  return `#${((Math.max(0, ((n >> 16) & 0xff) - Math.round(255 * amount)) << 16) | (Math.max(0, ((n >> 8) & 0xff) - Math.round(255 * amount)) << 8) | Math.max(0, (n & 0xff) - Math.round(255 * amount))).toString(16).padStart(6, '0')}`
}

export default React.memo(MapStage)
