import { BodyPartView } from '@/types/database';

export interface BodyZone {
  id: string;
  name: string;
  view: BodyPartView;
  category: 'Head & Neck' | 'Chest & Torso' | 'Back & Spine' | 'Arms & Hands' | 'Legs & Feet';
  description: string;
  // Marker relative position percentage (x: 0-100, y: 0-100) for positioning indicators on body SVG
  markerPos: { x: number; y: number };
}

export const ANTERIOR_BODY_ZONES: BodyZone[] = [
  {
    id: 'head-front',
    name: 'Head & Forehead',
    view: 'anterior',
    category: 'Head & Neck',
    description: 'Frontal head, face, forehead, temples, sinus region',
    markerPos: { x: 50, y: 8 },
  },
  {
    id: 'neck-front',
    name: 'Front Neck & Throat',
    view: 'anterior',
    category: 'Head & Neck',
    description: 'Anterior neck, throat, cervical lymph area',
    markerPos: { x: 50, y: 15 },
  },
  {
    id: 'shoulder-left-front',
    name: 'Right Shoulder (Front)',
    view: 'anterior',
    category: 'Arms & Hands',
    description: 'Right deltoid, clavicle, rotator cuff anterior',
    markerPos: { x: 34, y: 20 },
  },
  {
    id: 'shoulder-right-front',
    name: 'Left Shoulder (Front)',
    view: 'anterior',
    category: 'Arms & Hands',
    description: 'Left deltoid, clavicle, rotator cuff anterior',
    markerPos: { x: 66, y: 20 },
  },
  {
    id: 'chest',
    name: 'Chest & Pectorals',
    view: 'anterior',
    category: 'Chest & Torso',
    description: 'Pectoral muscles, sternum, ribcage anterior',
    markerPos: { x: 50, y: 26 },
  },
  {
    id: 'bicep-left',
    name: 'Right Bicep / Upper Arm',
    view: 'anterior',
    category: 'Arms & Hands',
    description: 'Right anterior upper arm, bicep brachii',
    markerPos: { x: 26, y: 28 },
  },
  {
    id: 'bicep-right',
    name: 'Left Bicep / Upper Arm',
    view: 'anterior',
    category: 'Arms & Hands',
    description: 'Left anterior upper arm, bicep brachii',
    markerPos: { x: 74, y: 28 },
  },
  {
    id: 'forearm-left-front',
    name: 'Right Forearm (Front)',
    view: 'anterior',
    category: 'Arms & Hands',
    description: 'Right anterior forearm flexors',
    markerPos: { x: 21, y: 38 },
  },
  {
    id: 'forearm-right-front',
    name: 'Left Forearm (Front)',
    view: 'anterior',
    category: 'Arms & Hands',
    description: 'Left anterior forearm flexors',
    markerPos: { x: 79, y: 38 },
  },
  {
    id: 'hand-left-front',
    name: 'Right Hand & Wrist',
    view: 'anterior',
    category: 'Arms & Hands',
    description: 'Right palm, wrist joint, fingers',
    markerPos: { x: 17, y: 47 },
  },
  {
    id: 'hand-right-front',
    name: 'Left Hand & Wrist',
    view: 'anterior',
    category: 'Arms & Hands',
    description: 'Left palm, wrist joint, fingers',
    markerPos: { x: 83, y: 47 },
  },
  {
    id: 'abdomen-upper',
    name: 'Upper Abdomen',
    view: 'anterior',
    category: 'Chest & Torso',
    description: 'Epigastric area, upper abdominal wall, stomach region',
    markerPos: { x: 50, y: 34 },
  },
  {
    id: 'abdomen-lower',
    name: 'Lower Abdomen / Pelvis',
    view: 'anterior',
    category: 'Chest & Torso',
    description: 'Hypogastric region, pelvic girdle, lower abs',
    markerPos: { x: 50, y: 42 },
  },
  {
    id: 'hip-left-front',
    name: 'Right Hip Flexor',
    view: 'anterior',
    category: 'Legs & Feet',
    description: 'Right groin, iliopsoas, anterior hip joint',
    markerPos: { x: 40, y: 48 },
  },
  {
    id: 'hip-right-front',
    name: 'Left Hip Flexor',
    view: 'anterior',
    category: 'Legs & Feet',
    description: 'Left groin, iliopsoas, anterior hip joint',
    markerPos: { x: 60, y: 48 },
  },
  {
    id: 'thigh-left-front',
    name: 'Right Quad / Thigh',
    view: 'anterior',
    category: 'Legs & Feet',
    description: 'Right anterior thigh, quadriceps femoris',
    markerPos: { x: 40, y: 58 },
  },
  {
    id: 'thigh-right-front',
    name: 'Left Quad / Thigh',
    view: 'anterior',
    category: 'Legs & Feet',
    description: 'Left anterior thigh, quadriceps femoris',
    markerPos: { x: 60, y: 58 },
  },
  {
    id: 'knee-left',
    name: 'Right Knee Joint',
    view: 'anterior',
    category: 'Legs & Feet',
    description: 'Right patella, knee ligaments, meniscus anterior',
    markerPos: { x: 41, y: 70 },
  },
  {
    id: 'knee-right',
    name: 'Left Knee Joint',
    view: 'anterior',
    category: 'Legs & Feet',
    description: 'Left patella, knee ligaments, meniscus anterior',
    markerPos: { x: 59, y: 70 },
  },
  {
    id: 'shin-left',
    name: 'Right Shin & Calf (Front)',
    view: 'anterior',
    category: 'Legs & Feet',
    description: 'Right tibia, tibialis anterior',
    markerPos: { x: 42, y: 81 },
  },
  {
    id: 'shin-right',
    name: 'Left Shin & Calf (Front)',
    view: 'anterior',
    category: 'Legs & Feet',
    description: 'Left tibia, tibialis anterior',
    markerPos: { x: 58, y: 81 },
  },
  {
    id: 'foot-left',
    name: 'Right Foot & Ankle',
    view: 'anterior',
    category: 'Legs & Feet',
    description: 'Right ankle joint, top of foot, toes',
    markerPos: { x: 42, y: 92 },
  },
  {
    id: 'foot-right',
    name: 'Left Foot & Ankle',
    view: 'anterior',
    category: 'Legs & Feet',
    description: 'Left ankle joint, top of foot, toes',
    markerPos: { x: 58, y: 92 },
  },
];

export const POSTERIOR_BODY_ZONES: BodyZone[] = [
  {
    id: 'head-back',
    name: 'Back of Head & Occipital',
    view: 'posterior',
    category: 'Head & Neck',
    description: 'Occiput, base of skull, scalp posterior',
    markerPos: { x: 50, y: 8 },
  },
  {
    id: 'neck-back',
    name: 'Neck & Cervical Spine',
    view: 'posterior',
    category: 'Head & Neck',
    description: 'Cervical vertebrae C1-C7, trapezius upper',
    markerPos: { x: 50, y: 15 },
  },
  {
    id: 'shoulder-left-back',
    name: 'Left Shoulder Blade / Scapula',
    view: 'posterior',
    category: 'Back & Spine',
    description: 'Left infraspinatus, posterior deltoid, scapula',
    markerPos: { x: 34, y: 21 },
  },
  {
    id: 'shoulder-right-back',
    name: 'Right Shoulder Blade / Scapula',
    view: 'posterior',
    category: 'Back & Spine',
    description: 'Right infraspinatus, posterior deltoid, scapula',
    markerPos: { x: 66, y: 21 },
  },
  {
    id: 'upper-back',
    name: 'Upper Back & Thoracic Spine',
    view: 'posterior',
    category: 'Back & Spine',
    description: 'Thoracic region T1-T12, rhomboids, mid-trapezius',
    markerPos: { x: 50, y: 25 },
  },
  {
    id: 'tricep-left',
    name: 'Left Upper Arm / Tricep',
    view: 'posterior',
    category: 'Arms & Hands',
    description: 'Left triceps brachii',
    markerPos: { x: 26, y: 28 },
  },
  {
    id: 'tricep-right',
    name: 'Right Upper Arm / Tricep',
    view: 'posterior',
    category: 'Arms & Hands',
    description: 'Right triceps brachii',
    markerPos: { x: 74, y: 28 },
  },
  {
    id: 'mid-back',
    name: 'Mid Back & Latissimus',
    view: 'posterior',
    category: 'Back & Spine',
    description: 'Latissimus dorsi, lumbar transition area',
    markerPos: { x: 50, y: 34 },
  },
  {
    id: 'forearm-left-back',
    name: 'Left Forearm (Back)',
    view: 'posterior',
    category: 'Arms & Hands',
    description: 'Left extensor muscle group, dorsal forearm',
    markerPos: { x: 21, y: 38 },
  },
  {
    id: 'forearm-right-back',
    name: 'Right Forearm (Back)',
    view: 'posterior',
    category: 'Arms & Hands',
    description: 'Right extensor muscle group, dorsal forearm',
    markerPos: { x: 79, y: 38 },
  },
  {
    id: 'lower-back',
    name: 'Lower Back & Lumbar Spine',
    view: 'posterior',
    category: 'Back & Spine',
    description: 'Lumbar L1-L5, quadratus lumborum, sacroiliac region',
    markerPos: { x: 50, y: 42 },
  },
  {
    id: 'hand-left-back',
    name: 'Left Back of Hand',
    view: 'posterior',
    category: 'Arms & Hands',
    description: 'Left dorsal hand surface, knuckles',
    markerPos: { x: 17, y: 47 },
  },
  {
    id: 'hand-right-back',
    name: 'Right Back of Hand',
    view: 'posterior',
    category: 'Arms & Hands',
    description: 'Right dorsal hand surface, knuckles',
    markerPos: { x: 83, y: 47 },
  },
  {
    id: 'glutes',
    name: 'Gluteal Region / Buttocks',
    view: 'posterior',
    category: 'Legs & Feet',
    description: 'Gluteus maximus, medius, piriformis',
    markerPos: { x: 50, y: 50 },
  },
  {
    id: 'hamstring-left',
    name: 'Left Hamstring',
    view: 'posterior',
    category: 'Legs & Feet',
    description: 'Left posterior thigh, biceps femoris',
    markerPos: { x: 40, y: 60 },
  },
  {
    id: 'hamstring-right',
    name: 'Right Hamstring',
    view: 'posterior',
    category: 'Legs & Feet',
    description: 'Right posterior thigh, biceps femoris',
    markerPos: { x: 60, y: 60 },
  },
  {
    id: 'calf-left',
    name: 'Left Calf & Gastrocnemius',
    view: 'posterior',
    category: 'Legs & Feet',
    description: 'Left gastrocnemius, soleus, posterior lower leg',
    markerPos: { x: 41, y: 76 },
  },
  {
    id: 'calf-right',
    name: 'Right Calf & Gastrocnemius',
    view: 'posterior',
    category: 'Legs & Feet',
    description: 'Right gastrocnemius, soleus, posterior lower leg',
    markerPos: { x: 59, y: 76 },
  },
  {
    id: 'achilles-left',
    name: 'Left Achilles & Heel',
    view: 'posterior',
    category: 'Legs & Feet',
    description: 'Left Achilles tendon, calcaneus heel',
    markerPos: { x: 42, y: 89 },
  },
  {
    id: 'achilles-right',
    name: 'Right Achilles & Heel',
    view: 'posterior',
    category: 'Legs & Feet',
    description: 'Right Achilles tendon, calcaneus heel',
    markerPos: { x: 58, y: 89 },
  },
];

export const ALL_BODY_ZONES = [...ANTERIOR_BODY_ZONES, ...POSTERIOR_BODY_ZONES];

export function getBodyZoneById(id: string): BodyZone | undefined {
  return ALL_BODY_ZONES.find((zone) => zone.id === id);
}

// Color map according to pain scale 1-10
export function getPainColor(level: number): {
  bg: string;
  text: string;
  border: string;
  fill: string;
  shadow: string;
  label: string;
} {
  if (level <= 3) {
    return {
      bg: 'bg-emerald-500/20 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/40',
      fill: '#10b981',
      shadow: 'shadow-emerald-500/30',
      label: 'Mild Pain',
    };
  }
  if (level <= 6) {
    return {
      bg: 'bg-amber-500/20 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/40',
      fill: '#f59e0b',
      shadow: 'shadow-amber-500/30',
      label: 'Moderate Pain',
    };
  }
  if (level <= 8) {
    return {
      bg: 'bg-orange-500/20 dark:bg-orange-950/40',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500/40',
      fill: '#f97316',
      shadow: 'shadow-orange-500/30',
      label: 'Severe Pain',
    };
  }
  return {
    bg: 'bg-rose-600/20 dark:bg-rose-950/40',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-600/40',
    fill: '#e11d48',
    shadow: 'shadow-rose-600/40',
    label: 'Critical / Extreme',
  };
}
