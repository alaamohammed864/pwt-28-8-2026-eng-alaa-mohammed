import { AnyPermit, PermitType } from '../types';

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

/**
 * Normalizes location string for robust fuzzy & sub-area matching
 */
export function normalizeLocation(loc: string): string {
  if (!loc) return '';
  return loc
    .toLowerCase()
    .replace(/[,\-_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if two location strings refer to the same plant area or overlapping zone
 */
export function isLocationOverlap(loc1: string, loc2: string): boolean {
  if (!loc1 || !loc2) return false;
  const n1 = normalizeLocation(loc1);
  const n2 = normalizeLocation(loc2);

  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;

  // Extract unit / zone numbers (e.g. "unit 44", "unit 45", "tank 102", "area 3")
  const extractKeys = (s: string) => {
    const matches = s.match(/(unit\s*\d+|zone\s*\d+|area\s*\d+|tank\s*\w+|vessel\s*\w+|platform\s*\d+)/gi);
    return matches ? matches.map((m) => m.toLowerCase().replace(/\s+/g, '')) : [];
  };

  const keys1 = extractKeys(n1);
  const keys2 = extractKeys(n2);

  for (const k1 of keys1) {
    if (keys2.includes(k1)) return true;
  }

  return false;
}

/**
 * Analyzes permit pairs to detect high-risk activity conflicts
 */
function evaluatePairConflict(p1: AnyPermit, p2: AnyPermit): SimopsConflict | null {
  const locOverlap = isLocationOverlap(p1.areaLocation, p2.areaLocation);
  if (!locOverlap) return null;

  // Only check Active or Pending permits
  const activeStatuses = ['Active', 'Pending'];
  if (!activeStatuses.includes(p1.status) || !activeStatuses.includes(p2.status)) {
    return null;
  }

  const types: [PermitType, PermitType] = [p1.type, p2.type];
  const hasType = (t: PermitType) => types.includes(t);

  // 1. HOT WORK + CONFINED SPACE (CRITICAL)
  if (hasType('HOT_WORK') && hasType('CONFINED_SPACE')) {
    const hw = p1.type === 'HOT_WORK' ? p1 : p2;
    const cs = p1.type === 'CONFINED_SPACE' ? p1 : p2;
    return {
      id: `simops-${p1.id}-${p2.id}`,
      severity: 'CRITICAL',
      areaLocation: p1.areaLocation,
      normalizedArea: normalizeLocation(p1.areaLocation),
      title: 'CRITICAL SIMOPS: Hot Work & Confined Space Entry Overlap',
      titleAr: 'خطر تعارض حرج: عمل ساخن ودخول مكان محصور في نفس الموقع',
      description: `Active Hot Work (${hw.permitNumber}) coincides with Confined Space Entry (${cs.permitNumber}) in ${p1.areaLocation}. High explosion and toxic fume ingress hazard.`,
      descriptionAr: `تداخل بين تصريح عمل ساخن (${hw.permitNumber}) وتصريح دخول مكان محصور (${cs.permitNumber}) في ${p1.areaLocation}. خطر اشتعال ودخول غازات سامة.`,
      permits: [p1, p2],
      conflictType: 'HOT_CONFINED',
      recommendedActions: [
        'Immediately halt hot cutting/welding within 15 meters of the vessel manway.',
        'Perform continuous atmospheric gas testing for LEL, O2, and H2S.',
        'Obtain explicit joint SIMOPS sign-off from Area HSE Superintendent.',
        'Ensure dedicated standby rescue team is on live alert.',
      ],
      recommendedActionsAr: [
        'إيقاف أعمال القطع واللحام فوراً ضمن دائرة قطرها 15 متراً من فتحة الدخول.',
        'إجراء فحص غازات مستمر لنسب الأكسجين والغازات القابلة للاشتعال.',
        'الحصول على موافقة تداخل عمليات مشتركة (SIMOPS) من مشرف السلامة.',
        'تأكيد جاهزية فريق الإنقاذ والمراقب الميداني.',
      ],
      detectedAt: new Date().toISOString(),
    };
  }

  // 2. HOT WORK + HOT WORK (HIGH)
  if (p1.type === 'HOT_WORK' && p2.type === 'HOT_WORK') {
    return {
      id: `simops-${p1.id}-${p2.id}`,
      severity: 'HIGH',
      areaLocation: p1.areaLocation,
      normalizedArea: normalizeLocation(p1.areaLocation),
      title: 'HIGH HAZARD: Dual Hot Work in Same Zone',
      titleAr: 'تداخل عالي الخطورة: عمل ساخن مزدوج في نفس المنطقة',
      description: `Multiple simultaneous hot work permits (${p1.permitNumber} & ${p2.permitNumber}) active in ${p1.areaLocation}. Spark radius overlap exceeds safety boundaries.`,
      descriptionAr: `وجود أكثر من تصريح عمل ساخن نشط (${p1.permitNumber} و ${p2.permitNumber}) في ${p1.areaLocation}. تداخل في دائرة الشرر وتشتت مراقبة الحريق.`,
      permits: [p1, p2],
      conflictType: 'HOT_HOT',
      recommendedActions: [
        'Verify independent fire watches are stationed for each hot work team.',
        'Maintain minimum 10-meter physical separation with flame-retardant curtains.',
        'Inspect all open drains and hydrocarbon lines between both work zones.',
      ],
      recommendedActionsAr: [
        'تأكيد وجود مراقب حريق مستقل لكل فريق عمل.',
        'الحفاظ على مسافة فاصلة 10 أمتار مع استخدام ستائر عازلة للشرر.',
        'تغطية وتأمين جميع قنوات التصريف المفتوحة بين موقعي العمل.',
      ],
      detectedAt: new Date().toISOString(),
    };
  }

  // 3. HOT WORK + EXCAVATION (CRITICAL)
  if (hasType('HOT_WORK') && hasType('EXCAVATION')) {
    const hw = p1.type === 'HOT_WORK' ? p1 : p2;
    const ex = p1.type === 'EXCAVATION' ? p1 : p2;
    return {
      id: `simops-${p1.id}-${p2.id}`,
      severity: 'CRITICAL',
      areaLocation: p1.areaLocation,
      normalizedArea: normalizeLocation(p1.areaLocation),
      title: 'CRITICAL HAZARD: Hot Work Over Underground Excavation',
      titleAr: 'خطر حرج: عمل ساخن فوق أو بجوار منطقة حفر وأنابيب مدفونة',
      description: `Hot work (${hw.permitNumber}) is active in the vicinity of excavation (${ex.permitNumber}) in ${p1.areaLocation}. Potential underground gas pocket or exposed hydrocarbon lines.`,
      descriptionAr: `أعمال قطع ولحام (${hw.permitNumber}) بجوار منطقة حفر (${ex.permitNumber}) في ${p1.areaLocation}. خطر اشتعال تسريبات الغاز أو خطوط الخدمات المدفونة.`,
      permits: [p1, p2],
      conflictType: 'HOT_EXCAVATION',
      recommendedActions: [
        'Verify underground line detector sweep before torch ignition.',
        'Place gas monitors inside the trench to detect heavy hydrocarbon vapors.',
        'Ensure excavation trench has positive ventilation if hot work is above.',
      ],
      recommendedActionsAr: [
        'التأكد من مسح الخطوط المدفونة قبل تشغيل مشاعل اللحام.',
        'وضع كواشف غاز داخل خندق الحفر لرصد الأبخرة الثقيلة.',
        'توفير تهوية ميكانيكية مناسبة لموقع الحفر.',
      ],
      detectedAt: new Date().toISOString(),
    };
  }

  // 4. CONFINED SPACE + MECHANICAL ISOLATION (CRITICAL)
  if (hasType('CONFINED_SPACE') && hasType('MECHANICAL_ISOLATION')) {
    const cs = p1.type === 'CONFINED_SPACE' ? p1 : p2;
    const iso = p1.type === 'MECHANICAL_ISOLATION' ? p1 : p2;
    return {
      id: `simops-${p1.id}-${p2.id}`,
      severity: 'CRITICAL',
      areaLocation: p1.areaLocation,
      normalizedArea: normalizeLocation(p1.areaLocation),
      title: 'CRITICAL HAZARD: Active Confined Space Entry During Process Isolation Change',
      titleAr: 'خطر حرج: دخول مكان محصور بالتزامن مع تعديل عزل ميكانيكي',
      description: `Confined space entry (${cs.permitNumber}) is active while mechanical isolation (${iso.permitNumber}) is under execution in ${p1.areaLocation}. Danger of accidental line pressurization.`,
      descriptionAr: `دخول مكان محصور (${cs.permitNumber}) متزامن مع أعمال عزل ميكانيكي (${iso.permitNumber}) في ${p1.areaLocation}. خطر تسرب ضغط أو سوائل سامة.`,
      permits: [p1, p2],
      conflictType: 'CONFINED_ISOLATION',
      recommendedActions: [
        'Confirm positive physical isolation (Spade/Blind) before permitting entry.',
        'Freeze all isolation valve adjustments until entrants exit the vessel.',
        'Verify LOTO master key lockbox is secured by Performing Authority.',
      ],
      recommendedActionsAr: [
        'تأكيد العزل الميكانيكي الإيجابي (عزل أعمى / كفيف) قبل السماح بالدخول.',
        'تجميد أي تحريك لصمامات العزل أثناء وجود أفراد داخل الوعاء.',
        'التحقق من تأمين صندوق مفاتيح العزل LOTO من قبل مسؤول التنفيذ.',
      ],
      detectedAt: new Date().toISOString(),
    };
  }

  // 5. EXCAVATION + MECHANICAL ISOLATION (HIGH)
  if (hasType('EXCAVATION') && hasType('MECHANICAL_ISOLATION')) {
    return {
      id: `simops-${p1.id}-${p2.id}`,
      severity: 'HIGH',
      areaLocation: p1.areaLocation,
      normalizedArea: normalizeLocation(p1.areaLocation),
      title: 'HIGH HAZARD: Heavy Excavation Near Isolated Manifolds',
      titleAr: 'خطر عالي: أعمال حفر ميكانيكي بالقرب من صمامات عزل ومجمعات أنابيب',
      description: `Excavation work (${p1.permitNumber}) occurring in the proximity of mechanical isolation (${p2.permitNumber}) in ${p1.areaLocation}. Vibration hazard to blinded flanges.`,
      descriptionAr: `أعمال حفر ميكانيكية (${p1.permitNumber}) بالقرب من صمامات عزل (${p2.permitNumber}) في ${p1.areaLocation}. خطر الاهتزاز على الفلانجات المعزولة.`,
      permits: [p1, p2],
      conflictType: 'EXCAVATION_ISOLATION',
      recommendedActions: [
        'Restrict excavation to manual hand digging within 3 meters of isolated lines.',
        'Inspect flange blinds for vibration-induced leakage.',
      ],
      recommendedActionsAr: [
        'حصر الحفر على الطرق اليدوية ضمن مسافة 3 أمتار من الأنابيب المعزولة.',
        'فحص الفلانجات المعزولة للتأكد من عدم تأثرها بالاهتزازات.',
      ],
      detectedAt: new Date().toISOString(),
    };
  }

  // 6. GENERAL ACTIVE PERMIT OVERLAP IN SAME EXACT LOCATION (MEDIUM)
  if (p1.id !== p2.id && (p1.status === 'Active' || p2.status === 'Active')) {
    return {
      id: `simops-${p1.id}-${p2.id}`,
      severity: 'MEDIUM',
      areaLocation: p1.areaLocation,
      normalizedArea: normalizeLocation(p1.areaLocation),
      title: 'SIMOPS Notice: Concurrent Work Activities in Same Plant Area',
      titleAr: 'تنبيه تداخل: أنشطة صيانة متزامنة في نفس وحدة التشغيل',
      description: `Permits ${p1.permitNumber} (${p1.title}) and ${p2.permitNumber} (${p2.title}) are both scheduled in ${p1.areaLocation}.`,
      descriptionAr: `التصريحان ${p1.permitNumber} و ${p2.permitNumber} يعملان بالتزامن في ${p1.areaLocation}. يتطلب تنسيقاً بين فرق العمل.`,
      permits: [p1, p2],
      conflictType: 'GENERAL_OVERLAP',
      recommendedActions: [
        'Conduct a joint pre-job safety briefing between both work crews.',
        'Establish clear spatial boundaries and designate access pathways.',
      ],
      recommendedActionsAr: [
        'عقد اجتماع سلامة مشترك (Toolbox Talk) لجميع الفرق العاملة.',
        'تحديد ممرات حركة ومناطق عمل واضحة لكل فريق.',
      ],
      detectedAt: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Scans all permits and returns unique detected SIMOPS conflicts
 */
export function detectAllSimopsConflicts(permits: AnyPermit[]): SimopsConflict[] {
  const conflicts: SimopsConflict[] = [];
  const processedPairKeys = new Set<string>();

  for (let i = 0; i < permits.length; i++) {
    for (let j = i + 1; j < permits.length; j++) {
      const p1 = permits[i];
      const p2 = permits[j];

      const pairKey = [p1.id, p2.id].sort().join('___');
      if (processedPairKeys.has(pairKey)) continue;

      const conflict = evaluatePairConflict(p1, p2);
      if (conflict) {
        processedPairKeys.add(pairKey);
        conflicts.push(conflict);
      }
    }
  }

  // Sort: CRITICAL first, then HIGH, then MEDIUM
  const severityRank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
  return conflicts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}

/**
 * Checks a newly drafted or editing permit against all existing permits in the system
 */
export function checkPermitConflicts(
  candidate: Partial<AnyPermit>,
  allPermits: AnyPermit[]
): SimopsConflict[] {
  if (!candidate.areaLocation || !candidate.type) return [];

  const tempPermit: AnyPermit = {
    id: candidate.id || 'candidate-temp',
    permitNumber: candidate.permitNumber || 'DRAFT-PTW',
    type: candidate.type,
    title: candidate.title || 'Candidate Permit',
    titleAr: candidate.titleAr || 'تصريح مقترح',
    status: (candidate.status as any) || 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: candidate.author || 'Current User',
    department: candidate.department || 'Operations',
    site: candidate.site || 'Plant',
    areaLocation: candidate.areaLocation,
    date: candidate.date || new Date().toISOString().split('T')[0],
    description: candidate.description || '',
  };

  const conflicts: SimopsConflict[] = [];
  for (const existing of allPermits) {
    if (existing.id === candidate.id) continue;
    const conflict = evaluatePairConflict(tempPermit, existing);
    if (conflict) {
      conflicts.push(conflict);
    }
  }

  const severityRank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
  return conflicts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}
