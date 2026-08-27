export type PermitType =
  | 'GENERAL_PTW'
  | 'HOT_WORK'
  | 'COLD_WORK'
  | 'CONFINED_SPACE'
  | 'EXCAVATION'
  | 'MECHANICAL_ISOLATION';

export type PermitStatus =
  | 'Draft'
  | 'Pending'
  | 'Active'
  | 'Suspended'
  | 'Closed'
  | 'Archived';

export interface GasTestRecord {
  gasType: string;
  arabicName: string;
  acceptableRange: string;
  unit: string;
  minSafe?: number;
  maxSafe?: number;
  reading: string;
  time: string;
  isSafe?: boolean;
}

export interface IsolationPoint {
  id: string;
  valveTag: string;
  lo: boolean; // Locked Open
  lc: boolean; // Locked Close
  sp: boolean; // Spade
  b: boolean;  // Blinded
  di: boolean; // Disconnect Instruments
  isolatedBy: string;
  isolatedDate: string;
  verifiedBy: string;
  verifiedDate: string;
}

export interface DigitalSignature {
  name: string;
  title?: string;
  date: string;
  time?: string;
  signatureData?: string; // canvas data url or drawn text
  signed: boolean;
}

export interface BasePermit {
  id: string;
  permitNumber: string;
  type: PermitType;
  title: string;
  titleAr: string;
  status: PermitStatus;
  createdAt: string;
  updatedAt: string;
  author: string;
  department: string;
  site: string;
  areaLocation: string;
  date: string;
  validityStart?: string;
  validityEnd?: string;
  description: string;
  equipment?: string;
  contractor?: string;
  tools?: string;
}

export interface HotWorkPermitData extends BasePermit {
  type: 'HOT_WORK';
  hazards: {
    flammableGas: boolean;
    combustibleMaterials: boolean;
    sparksSlag: boolean;
    highTemperature: boolean;
    fumesDust?: boolean;
    radiation?: boolean;
  };
  ppe: {
    weldingMask: boolean;
    fireRetardantSuit: boolean;
    leatherGloves: boolean;
    faceShield: boolean;
    earPlugs?: boolean;
    safetyBoots?: boolean;
  };
  precautions: {
    fireExtinguisherAtLocation: boolean;
    cleared10mRadius: boolean;
    fireWatchAppointed: boolean;
    waterHoseReady?: boolean;
    smokeDetectorsIsolated?: boolean;
  };
  requestorSignature: DigitalSignature;
  approverSignature: DigitalSignature;
}

export interface ColdWorkPermitData extends BasePermit {
  type: 'COLD_WORK';
  hazards: {
    liquidGasPressure: boolean;
    toxicMaterials: boolean;
    flyingParticles: boolean;
    electricity: boolean;
    rotatingMachinery: boolean;
    dangerOfFalling: boolean;
  };
  hseRequirements: {
    protectiveClothing: boolean;
    gogglesFaceShield: boolean;
    handsProtection: boolean;
    dustMask: boolean;
    barriersWarningSigns: boolean;
  };
  performingAuthoritySign: DigitalSignature;
  affectedAreaAuthoritySign: DigitalSignature;
}

export interface ConfinedSpacePermitData extends BasePermit {
  type: 'CONFINED_SPACE';
  plantArea: string;
  vesselNo: string;
  preparation: {
    loto: 'Yes' | 'NA' | 'No';
    purged: 'Yes' | 'NA' | 'No';
    mechanicallyVentilated: 'Yes' | 'NA' | 'No';
    blindedPositively?: 'Yes' | 'NA' | 'No';
  };
  gasTests: GasTestRecord[];
  gasTesterName: string;
  deviceSerialNo: string;
  ppe: {
    safetyHarnessLifeline: boolean;
    breathingApparatus: boolean;
    chemicalSuit: boolean;
    gogglesFaceShield: boolean;
  };
  rescuePlan: {
    standbyPerson: string;
    communicationMethod: 'Two-way Radio' | 'Visual / Hand Signals' | 'Voice / Shout' | 'Tether Pull';
    rescueTeamNotified: boolean;
  };
  approverSignature: DigitalSignature;
}

export interface ExcavationPermitData extends BasePermit {
  type: 'EXCAVATION';
  permitNumberReference: string;
  purpose: string;
  expectedDepth: number;
  excavationMethod: 'Manual / يدوي' | 'Mechanical / ميكانيكي' | 'Mixed / مختلط';
  undergroundServices: {
    electrical: boolean;
    telecom: boolean;
    pipingWaterGas: boolean;
    sewageDrainage?: boolean;
    cathodicProtection?: boolean;
  };
  shoringRequired: boolean;
  gasTestingRequired: boolean;
  requestorSignature: DigitalSignature;
  safetyEngineerSignature: DigitalSignature;
}

export interface MechanicalIsolationPermitData extends BasePermit {
  type: 'MECHANICAL_ISOLATION';
  tagNo: string;
  reasonsForIsolation: string;
  natureOfWork: string;
  performerSign: DigitalSignature;
  performingAuthoritySign: DigitalSignature;
  areaAuthoritySign: DigitalSignature;
  isolationPoints: IsolationPoint[];
  temporaryDeIsolation: {
    reason: string;
    requestedBy: string;
    approvedBy: string;
    status: 'None' | 'Active' | 'Re-isolated';
  };
  clearanceReinstatement: {
    declaredReady: boolean;
    performerSign: DigitalSignature;
    isolationAuthoritySign: DigitalSignature;
  };
}

export type AnyPermit =
  | BasePermit
  | HotWorkPermitData
  | ColdWorkPermitData
  | ConfinedSpacePermitData
  | ExcavationPermitData
  | MechanicalIsolationPermitData;

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  read: boolean;
}

export interface SimopsConflict {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  areaLocation: string;
  normalizedArea: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  permits: AnyPermit[];
  conflictType: 'HOT_CONFINED' | 'HOT_HOT' | 'HOT_EXCAVATION' | 'CONFINED_ISOLATION' | 'EXCAVATION_ISOLATION' | 'GENERAL_OVERLAP';
  recommendedActions: string[];
  recommendedActionsAr: string[];
  detectedAt: string;
}
