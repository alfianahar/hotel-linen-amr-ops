import { EBoxType, IAPBox, IMapConfig, IMapRegion, ISpecialLMBox, TMapBox, EParkingArea } from "./types";

export const basementMapConfig: IMapConfig = {
  width: 1200,
  height: 580,
  resolution: 0.01,
  origin: { x: 0, y: 0 },
  scale: 1,
};

export const BASEMENT_REGIONS: IMapRegion[] = [
  {
    id: "basement-dispatch", label: "Loading Bay",
    rect: { x: 10, y: 30, width: 230, height: 270 },
    fillColor: "rgba(250, 204, 21, 0.18)", borderColor: "rgba(161, 98, 7, 0.85)", labelColor: "#78350f",
  },
  {
    id: "basement-storage", label: "Clean Linen Room",
    rect: { x: 405, y: 30, width: 145, height: 230 },
    fillColor: "rgba(34, 197, 94, 0.16)", borderColor: "rgba(21, 128, 61, 0.85)", labelColor: "#14532d",
  },
  {
    id: "basement-main", label: "Parking Area",
    rect: { x: 565, y: 10, width: 270, height: 550 },
    fillColor: "rgba(59, 130, 246, 0.14)", borderColor: "rgba(30, 64, 175, 0.85)", labelColor: "#1e3a8a",
  },
  {
    id: "basement-dirty-linen", label: "Dirty Linen Room",
    rect: { x: 875, y: 350, width: 155, height: 210 },
    fillColor: "rgba(168, 85, 247, 0.14)", borderColor: "rgba(107, 33, 168, 0.85)", labelColor: "#581c87",
  },
  {
    id: "basement-elevator", label: "Elevator Area",
    rect: { x: 1055, y: 30, width: 135, height: 250 },
    fillColor: "rgba(255, 159, 64, 0.14)", borderColor: "rgba(230, 92, 0, 0.85)", labelColor: "#e65100",
  },
];

export const basementBoxes: TMapBox[] = [
  { id: 'AP1', type: EBoxType.AP, label: 'B1', pose: { position: { x: 55, y: 95 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EDispatch },
  { id: 'AP2', type: EBoxType.AP, label: 'B2', pose: { position: { x: 115, y: 95 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EDispatch },
  { id: 'AP3', type: EBoxType.AP, label: 'B3', pose: { position: { x: 175, y: 95 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EDispatch },
  { id: 'AP5', type: EBoxType.AP, label: 'B5', pose: { position: { x: 55, y: 175 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EDispatch },
  { id: 'AP4', type: EBoxType.AP, label: 'B4', pose: { position: { x: 175, y: 175 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EDispatch },
  { id: 'AP6', type: EBoxType.AP, label: 'B6', pose: { position: { x: 445, y: 95 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EStorage },
  { id: 'AP7', type: EBoxType.AP, label: 'B7', pose: { position: { x: 505, y: 95 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EStorage },
  { id: 'AP8', type: EBoxType.AP, label: 'B8', pose: { position: { x: 605, y: 80 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EMain },
  { id: 'AP9', type: EBoxType.AP, label: 'B9', pose: { position: { x: 665, y: 80 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EMain },
  { id: 'AP10', type: EBoxType.AP, label: 'B10', pose: { position: { x: 725, y: 80 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EMain },
  { id: 'AP11', type: EBoxType.AP, label: 'B11', pose: { position: { x: 785, y: 80 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EMain },
  { id: 'AP12', type: EBoxType.AP, label: 'B12', pose: { position: { x: 605, y: 170 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EMain },
  { id: 'AP13', type: EBoxType.AP, label: 'B13', pose: { position: { x: 665, y: 170 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EMain },
  { id: 'AP14', type: EBoxType.AP, label: 'B14', pose: { position: { x: 725, y: 170 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EMain },
  { id: 'AP15', type: EBoxType.AP, label: 'B15', pose: { position: { x: 605, y: 320 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EMain },
  { id: 'AP16', type: EBoxType.AP, label: 'B16', pose: { position: { x: 665, y: 320 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EMain },
  { id: 'AP17', type: EBoxType.AP, label: 'B17', pose: { position: { x: 725, y: 320 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EMain },
  { id: 'AP18', type: EBoxType.AP, label: 'B18', pose: { position: { x: 785, y: 320 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EMain },
  { id: 'AP19', type: EBoxType.AP, label: 'B19', pose: { position: { x: 915, y: 430 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EChute },
  { id: 'AP20', type: EBoxType.AP, label: 'B20', pose: { position: { x: 985, y: 430 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EChute },
  { id: 'CP1', type: EBoxType.CP, label: 'CP1', pose: { position: { x: 605, y: 500 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EMain },
  { id: 'CP2', type: EBoxType.CP, label: 'CP2', pose: { position: { x: 725, y: 500 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EMain },

  // Special LM boxes
  { id: 'LM23', type: EBoxType.ELEVATOR, label: 'Elevator', lmId: 'LM23', description: 'Elevator',
    pose: { position: { x: 1120, y: 110 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EElevator } as ISpecialLMBox,
  { id: 'LM22', type: EBoxType.ELEVATOR, label: 'LM22', lmId: 'LM22', description: 'Elevator',
    pose: { position: { x: 1120, y: 200 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EMain } as ISpecialLMBox,
  { id: 'LM33', type: EBoxType.DISPATCH, label: 'Dispatch', lmId: 'LM33', description: 'Dispatch Room Entry',
    pose: { position: { x: 55, y: 220 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EDispatch } as ISpecialLMBox,
  { id: 'LM43', type: EBoxType.DISPATCH, label: 'Dispatch', lmId: 'LM43', description: 'Dispatch Room Exit',
    pose: { position: { x: 55, y: 250 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EMain } as ISpecialLMBox,
  { id: 'LM38', type: EBoxType.CHUTE, label: 'Dirty Linen', lmId: 'LM38', description: 'Dirty Linen Area',
    pose: { position: { x: 950, y: 110 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EChute } as ISpecialLMBox,
  { id: 'LM34', type: EBoxType.RFID_KABINET, label: 'RFID', lmId: 'LM34', description: 'RFID Cabinet',
    pose: { position: { x: 445, y: 195 }, orientation: { x: 0, y: 0, z: 0, w: 1 } }, isClickable: true, floor: 0, area: EParkingArea.EMain } as ISpecialLMBox,
];
