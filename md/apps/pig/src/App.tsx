import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  CheckSquare, 
  Square, 
  Play, 
  Square as Stop, 
  RotateCcw, 
  Search, 
  Info, 
  ChevronDown, 
  Clock, 
  User, 
  AlertTriangle, 
  HeartPulse, 
  FileText,
  Bookmark,
  CheckCircle2,
  ListRestart,
  Scissors,
  Layers,
  Sparkles,
  Wind
} from 'lucide-react';

// Custom beautifully detailed Endotracheal Tube SVG icon to use as background and visual accent
function EndotrachealTubeIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Tube connector at the top-left */}
      <rect x="24" y="16" width="14" height="12" rx="1.5" fill="currentColor" opacity="0.15" />
      <path d="M31 16v-6h4v6" strokeWidth="2" />
      
      {/* Main curved tubing body */}
      <path d="M31 28 C31 52, 42 76, 76 76" strokeWidth="6.5" />
      {/* Inner outline indicator lines */}
      <path d="M34 28 C34 49, 44 72, 72 72" strokeWidth="1.5" opacity="0.4" />
      
      {/* Inflatable balloon cuff at distal end */}
      <ellipse cx="61" cy="72" rx="10" ry="7.5" transform="rotate(-12 61 72)" fill="currentColor" opacity="0.3" />
      <path d="M51 70 C51 75, 71 75, 71 70" strokeWidth="1" opacity="0.5" />
      
      {/* Pilot balloon line and syringe valve */}
      <path d="M48 54 C40 60, 36 63, 31 71" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="29" cy="74" r="3.5" fill="currentColor" opacity="0.4" />
      <path d="M29 74l-2 2" strokeWidth="1.5" />
      
      {/* Beveled breathing tip */}
      <path d="M76 76l-5-5" strokeWidth="2.5" />
      
      {/* Depth cm hashmarks on the tube */}
      <path d="M33 34h-4" strokeWidth="1.5" />
      <path d="M36 42h-4" strokeWidth="1.5" />
      <path d="M40 50l-3 2" strokeWidth="1.5" />
      <path d="M45 58l-2 3" strokeWidth="1.5" />
      <path d="M51 66l-1 3" strokeWidth="1.5" />
    </svg>
  );
}

// Custom beautifully detailed Laryngoscope SVG icon
function LaryngoscopeIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Laryngoscope Handle */}
      <rect x="35" y="45" width="12" height="42" rx="2" fill="currentColor" opacity="0.15" />
      {/* Grip pattern */}
      <path d="M35 53h12M35 61h12M35 69h12M35 77h12" strokeWidth="1.5" opacity="0.4" />
      
      {/* Connection base */}
      <rect x="33" y="38" width="16" height="7" rx="1" fill="currentColor" />
      
      {/* Curved Blade (Miller or Macintosh style) */}
      <path d="M41 38 C41 28, 50 18, 78 18" strokeWidth="5" />
      {/* Small bulb / light source near the tip */}
      <circle cx="68" cy="21" r="2.5" fill="currentColor" className="animate-pulse" />
      <path d="M78 18 C72 20, 60 26, 41 26" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

// Custom beautifully detailed Depth Ruler SVG icon
function DepthRulerIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="15" y="35" width="70" height="30" rx="3" fill="currentColor" opacity="0.15" />
      <path d="M25 35v12M35 35v6M45 35v12M55 35v6M65 35v12M75 35v6" strokeWidth="2" />
      <path d="M20 55h60" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}

// Custom beautifully detailed Laryngeal Mask Airway SVG icon
function LmaIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Tube connector */}
      <path d="M50 15v35" strokeWidth="4" />
      {/* Elliptical inflated mask collar */}
      <ellipse cx="50" cy="65" rx="16" ry="22" fill="currentColor" opacity="0.15" />
      {/* Inner opening */}
      <ellipse cx="50" cy="65" rx="6" ry="10" strokeWidth="1.5" />
    </svg>
  );
}

// Custom beautifully detailed Suction Catheter SVG icon
function SuctionIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Curved suction catheter tip */}
      <path d="M30 80 C30 50, 45 25, 75 25" strokeWidth="4.5" />
      {/* Suction ports at tip */}
      <circle cx="71" cy="27" r="1.5" fill="currentColor" />
      <circle cx="67" cy="31" r="1.5" fill="currentColor" />
      {/* Handgrip handle */}
      <path d="M30 65l-5 20h10l-5-20" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

// Custom beautifully detailed Bougie SVG icon
function BougieIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Long thin catheter with coude (curved) tip */}
      <path d="M25 80 L65 40 C70 35, 75 33, 82 31" strokeWidth="3" />
      {/* Angled distal tip indicator (coude) */}
      <path d="M82 31l6-5" strokeWidth="3.5" />
      {/* Grid increments markings */}
      <path d="M35 70l-3-3M45 60l-3-3M55 50l-3-3" strokeWidth="1.5" />
    </svg>
  );
}

// Custom beautifully detailed Stylet SVG icon
function StyletIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Hyperangulated metal stylet with ring grip at top */}
      <circle cx="25" cy="25" r="6" strokeWidth="3" />
      <path d="M31 25 L55 25 C65 25, 75 35, 75 55 L75 80" strokeWidth="3" />
    </svg>
  );
}

// Custom beautifully detailed Gastric Tube SVG icon
function GastricTubeIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Stomach shape background with thin tube entering it */}
      <path d="M40 20 L40 45" strokeWidth="2.5" />
      <path d="M40 45 C20 45, 15 75, 45 80 C70 85, 80 65, 65 50 C55 38, 45 45, 40 45" strokeWidth="3" fill="currentColor" opacity="0.15" />
    </svg>
  );
}

interface SubGroup {
  id: string;
  name: string;
  ettSize: string;
  dlBlade: string;
  glidescopeDl: string;
  glidescopeLoPro: string;
  glidescopeLoProStylet: string;
  ettDepth: string;
  bougie: string;
  lma: string;
  ngTube: string;
  suctionCatheter: string;
  apneicO2: string;
  apneicO2Text: string;
  weightKg: number;
}

interface MainAgeGroup {
  id: string;
  label: string; // "NB-6m", "6m-12m", "12m-18m", etc.
  fullName: string;
  details: string;
  subGroups?: SubGroup[];
  weightKg?: number;
  // Fallbacks if no subGroups are specified
  ettSize?: string;
  dlBlade?: string;
  glidescopeDl?: string;
  glidescopeLoPro?: string;
  glidescopeLoProStylet?: string;
  ettDepth?: string;
  bougie?: string;
  lma?: string;
  ngTube?: string;
  suctionCatheter?: string;
  apneicO2?: string;
  apneicO2Text?: string;
}

const AGE_GROUPS: MainAgeGroup[] = [
  {
    id: 'nb_6m',
    label: 'NB-6m',
    fullName: 'Newborn to 6 Months',
    details: 'Birth to < 6 months',
    subGroups: [
      {
        id: 'nb',
        name: 'Newborn (Term)',
        ettSize: '3.0',
        dlBlade: '0-1',
        glidescopeDl: 'Mil 1',
        glidescopeLoPro: '1',
        glidescopeLoProStylet: '--',
        ettDepth: '9-10',
        bougie: '--',
        lma: '1',
        ngTube: '5-8',
        suctionCatheter: '6',
        apneicO2: '5L',
        apneicO2Text: '< 1 yr = 5L',
        weightKg: 3.5
      },
      {
        id: 'lt6m',
        name: '1 to 6 Months',
        ettSize: '3.5',
        dlBlade: '1',
        glidescopeDl: 'Mil 1',
        glidescopeLoPro: '1',
        glidescopeLoProStylet: '--',
        ettDepth: '9-10',
        bougie: '--',
        lma: '1',
        ngTube: '8',
        suctionCatheter: '8',
        apneicO2: '5L',
        apneicO2Text: '< 1 yr = 5L',
        weightKg: 5.5
      }
    ]
  },
  {
    id: '6m_12m',
    label: '6m-12m',
    fullName: '6 to 12 Months',
    details: 'Infant (6 months to < 1 year)',
    ettSize: '3.5',
    dlBlade: '1',
    glidescopeDl: 'Mil 1',
    glidescopeLoPro: '1 - 2',
    glidescopeLoProStylet: '--',
    ettDepth: '11-12',
    bougie: '--',
    lma: '1.5',
    ngTube: '8',
    suctionCatheter: '8-10',
    apneicO2: '5L',
    apneicO2Text: '< 1 yr = 5L',
    weightKg: 8.5
  },
  {
    id: '12m_18m',
    label: '12m-18m',
    fullName: '12 to 18 Months',
    details: 'Toddler (12 to 18 months)',
    ettSize: '3.5',
    dlBlade: '1',
    glidescopeDl: 'Mil 1',
    glidescopeLoPro: '2',
    glidescopeLoProStylet: '--',
    ettDepth: '12',
    bougie: '--',
    lma: '1.5',
    ngTube: '8',
    suctionCatheter: '10',
    apneicO2: '10L',
    apneicO2Text: '1-7 yr = 10L',
    weightKg: 10.5
  },
  {
    id: '18m_2y',
    label: '18m-2y',
    fullName: '18 Months to 2 Years',
    details: 'Toddler (18 to 23 months)',
    ettSize: '4.0',
    dlBlade: '1-1.5',
    glidescopeDl: '2',
    glidescopeLoPro: '2',
    glidescopeLoProStylet: '--',
    ettDepth: '12-13',
    bougie: '--',
    lma: '2',
    ngTube: '8',
    suctionCatheter: '10',
    apneicO2: '10L',
    apneicO2Text: '1-7 yr = 10L',
    weightKg: 12.0
  },
  {
    id: '2y_3y',
    label: '2y-3y',
    fullName: '2 to 3 Years',
    details: 'Young Child (24 to 35 months)',
    ettSize: '4.0',
    dlBlade: '1.5-2',
    glidescopeDl: '2',
    glidescopeLoPro: '2 - 2.5',
    glidescopeLoProStylet: '--',
    ettDepth: '13-14',
    bougie: 'Pedi',
    lma: '2',
    ngTube: '8',
    suctionCatheter: '10',
    apneicO2: '10L',
    apneicO2Text: '1-7 yr = 10L',
    weightKg: 14.0
  },
  {
    id: '3y_5y',
    label: '3y-5y',
    fullName: '3 to 5 Years',
    details: 'Preschool age (3 to 5 years)',
    subGroups: [
      {
        id: '3_4y',
        name: '3 - 4 Years',
        ettSize: '4.5',
        dlBlade: '2',
        glidescopeDl: '2',
        glidescopeLoPro: '2 - 2.5',
        glidescopeLoProStylet: 'M',
        ettDepth: '14',
        bougie: 'Pedi',
        lma: '2',
        ngTube: '10',
        suctionCatheter: '10',
        apneicO2: '10L',
        apneicO2Text: '1-7 yr = 10L',
        weightKg: 16.0
      },
      {
        id: '5y',
        name: '5 Years',
        ettSize: '5.0',
        dlBlade: '2',
        glidescopeDl: '2',
        glidescopeLoPro: '2.5 - 3',
        glidescopeLoProStylet: 'M',
        ettDepth: '14-15',
        bougie: 'Pedi',
        lma: '2.5',
        ngTube: '10',
        suctionCatheter: '10',
        apneicO2: '10L',
        apneicO2Text: '1-7 yr = 10L',
        weightKg: 19.0
      }
    ]
  },
  {
    id: '6y_8y',
    label: '6y-8y',
    fullName: '6 to 8 Years',
    details: 'School age child (6 to 7 years)',
    ettSize: '5.0',
    dlBlade: '2',
    glidescopeDl: '2',
    glidescopeLoPro: '2.5 - 3',
    glidescopeLoProStylet: 'M',
    ettDepth: '15-16',
    bougie: 'Pedi',
    lma: '2.5',
    ngTube: '10',
    suctionCatheter: '10',
    apneicO2: '10L',
    apneicO2Text: '1-7 yr = 10L',
    weightKg: 24.0
  },
  {
    id: '8y_10y',
    label: '8y-10y',
    fullName: '8 to 10 Years',
    details: 'School age child (8 to 9 years)',
    ettSize: '5.5',
    dlBlade: '2',
    glidescopeDl: '2',
    glidescopeLoPro: '2.5 - 3',
    glidescopeLoProStylet: 'M',
    ettDepth: '16-18',
    bougie: 'Pedi',
    lma: '2.5',
    ngTube: '10-12',
    suctionCatheter: '14',
    apneicO2: '15L',
    apneicO2Text: '8+ yr = 15L',
    weightKg: 30.0
  },
  {
    id: '10y_12y',
    label: '10y-12y',
    fullName: '10 to 12 Years',
    details: 'Pre-teen (10 to 11 years)',
    ettSize: '6.0',
    dlBlade: '2',
    glidescopeDl: 'Mac 3',
    glidescopeLoPro: '3',
    glidescopeLoProStylet: 'L',
    ettDepth: '17-19',
    bougie: 'Adult',
    lma: '3',
    ngTube: '12',
    suctionCatheter: '14',
    apneicO2: '15L',
    apneicO2Text: '8+ yr = 15L',
    weightKg: 38.0
  },
  {
    id: '12y_14y',
    label: '12y-14y',
    fullName: '12 to 14 Years',
    details: 'Adolescent (12 to 13 years)',
    ettSize: '6.0-7.0',
    dlBlade: '3',
    glidescopeDl: 'Mac 3, 4',
    glidescopeLoPro: '3 - 4',
    glidescopeLoProStylet: 'L',
    ettDepth: '18-20',
    bougie: 'Adult',
    lma: '3-4',
    ngTube: '12',
    suctionCatheter: '14',
    apneicO2: '15L',
    apneicO2Text: '8+ yr = 15L',
    weightKg: 48.0
  },
  {
    id: '14y_16y',
    label: '14y-16y',
    fullName: '14 to 16 Years',
    details: 'Adolescent (14 to 15 years)',
    ettSize: '7.0',
    dlBlade: '3',
    glidescopeDl: 'Mac 3, 4',
    glidescopeLoPro: '3 - 4',
    glidescopeLoProStylet: 'L',
    ettDepth: '18-21',
    bougie: 'Adult',
    lma: '4',
    ngTube: '14',
    suctionCatheter: '14',
    apneicO2: '15L',
    apneicO2Text: '8+ yr = 15L',
    weightKg: 58.0
  },
  {
    id: '16y_plus',
    label: '16y+',
    fullName: '16+ Years',
    details: 'Adolescent (16+ years)',
    ettSize: '7.5',
    dlBlade: '3 or 4',
    glidescopeDl: 'Mac 3, 4',
    glidescopeLoPro: '3 - 4',
    glidescopeLoProStylet: 'L',
    ettDepth: '21',
    bougie: 'Adult',
    lma: '5',
    ngTube: '16',
    suctionCatheter: '16',
    apneicO2: '15L',
    apneicO2Text: '8+ yr = 15L',
    weightKg: 70.0
  }
];

// Helper function to fetch standard pediatric normal vital signs by age group
function getNormalVitalSigns(mainId: string, subId?: string): {
  hrRange: string;
  rrRange: string;
  sbpRange: string;
  hypotensionLimit: string;
  ageContext: string;
} {
  if (subId === 'nb') {
    return {
      hrRange: '100 - 180',
      rrRange: '30 - 60',
      sbpRange: '60 - 90',
      hypotensionLimit: '<60',
      ageContext: 'Newborn (<28 days)'
    };
  }
  if (subId === 'lt6m') {
    return {
      hrRange: '100 - 180',
      rrRange: '30 - 60',
      sbpRange: '70 - 100',
      hypotensionLimit: '<70',
      ageContext: 'Infant (1-6 months)'
    };
  }
  if (mainId === '6m_12m') {
    return {
      hrRange: '100 - 160',
      rrRange: '24 - 38',
      sbpRange: '72 - 104',
      hypotensionLimit: '<70',
      ageContext: 'Infant (6-12 months)'
    };
  }
  if (mainId === '12m_18m') {
    return {
      hrRange: '98 - 140',
      rrRange: '22 - 30',
      sbpRange: '80 - 104',
      hypotensionLimit: '<72',
      ageContext: 'Toddler (12-18 months)'
    };
  }
  if (mainId === '18m_2y') {
    return {
      hrRange: '98 - 140',
      rrRange: '22 - 30',
      sbpRange: '82 - 106',
      hypotensionLimit: '<73',
      ageContext: 'Toddler (18-24 months)'
    };
  }
  if (mainId === '2y_3y') {
    return {
      hrRange: '98 - 140',
      rrRange: '22 - 30',
      sbpRange: '84 - 106',
      hypotensionLimit: '<74',
      ageContext: 'Young Child (2 years)'
    };
  }
  if (subId === '3_4y') {
    return {
      hrRange: '80 - 120',
      rrRange: '20 - 24',
      sbpRange: '86 - 110',
      hypotensionLimit: '<76',
      ageContext: 'Preschooler (3-4 years)'
    };
  }
  if (subId === '5y') {
    return {
      hrRange: '80 - 120',
      rrRange: '20 - 24',
      sbpRange: '88 - 110',
      hypotensionLimit: '<80',
      ageContext: 'Child (5 years)'
    };
  }
  if (mainId === '3y_5y') {
    return {
      hrRange: '80 - 120',
      rrRange: '20 - 24',
      sbpRange: '86 - 110',
      hypotensionLimit: '<76',
      ageContext: 'Preschooler (3-5 years)'
    };
  }
  if (mainId === '6y_8y') {
    return {
      hrRange: '75 - 118',
      rrRange: '18 - 25',
      sbpRange: '90 - 115',
      hypotensionLimit: '<82',
      ageContext: 'School-Age (6-8 years)'
    };
  }
  if (mainId === '8y_10y') {
    return {
      hrRange: '75 - 118',
      rrRange: '18 - 25',
      sbpRange: '94 - 120',
      hypotensionLimit: '<86',
      ageContext: 'School-Age (8-10 years)'
    };
  }
  if (mainId === '10y_12y') {
    return {
      hrRange: '75 - 118',
      rrRange: '18 - 25',
      sbpRange: '98 - 122',
      hypotensionLimit: '<90',
      ageContext: 'Pre-teen (10-12 years)'
    };
  }
  if (mainId === '12y_14y') {
    return {
      hrRange: '60 - 100',
      rrRange: '12 - 20',
      sbpRange: '100 - 126',
      hypotensionLimit: '<90',
      ageContext: 'Adolescent (12-14 years)'
    };
  }
  if (mainId === '14y_16y') {
    return {
      hrRange: '60 - 100',
      rrRange: '12 - 20',
      sbpRange: '104 - 128',
      hypotensionLimit: '<90',
      ageContext: 'Adolescent (14-16 years)'
    };
  }
  if (mainId === '16y_plus') {
    return {
      hrRange: '60 - 100',
      rrRange: '12 - 20',
      sbpRange: '110 - 130',
      hypotensionLimit: '<90',
      ageContext: 'Adolescent (16+ years)'
    };
  }

  return {
    hrRange: '60 - 100',
    rrRange: '12 - 20',
    sbpRange: '90 - 120',
    hypotensionLimit: '<90',
    ageContext: 'Standard Pediatric'
  };
}

export default function App() {
  const [selectedMainIdx, setSelectedMainIdx] = useState<number>(0);
  const [selectedSubId, setSelectedSubId] = useState<string>('nb'); // Initial default newborn
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  
  // Stopwatch states for emergency procedure
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const activeMainGroup = AGE_GROUPS[selectedMainIdx];
  
  // If active group has subGroups, select the active one or default to the first one
  const activeSubGroup = activeMainGroup.subGroups 
    ? (activeMainGroup.subGroups.find(sg => sg.id === selectedSubId) || activeMainGroup.subGroups[0]) 
    : undefined;

  // Derive current equipment parameters cleanly
  const currentEttSize = activeSubGroup ? activeSubGroup.ettSize : (activeMainGroup.ettSize || '');
  const currentDlBlade = activeSubGroup ? activeSubGroup.dlBlade : (activeMainGroup.dlBlade || '');
  const currentGlidescopeDl = activeSubGroup ? activeSubGroup.glidescopeDl : (activeMainGroup.glidescopeDl || '');
  const currentGlidescopeLoPro = activeSubGroup ? activeSubGroup.glidescopeLoPro : (activeMainGroup.glidescopeLoPro || '');
  const currentGlidescopeLoProStylet = activeSubGroup ? activeSubGroup.glidescopeLoProStylet : (activeMainGroup.glidescopeLoProStylet || '');
  const currentEttDepth = activeSubGroup ? activeSubGroup.ettDepth : (activeMainGroup.ettDepth || '');
  const currentBougie = activeSubGroup ? activeSubGroup.bougie : (activeMainGroup.bougie || '');
  const currentLma = activeSubGroup ? activeSubGroup.lma : (activeMainGroup.lma || '');
  const currentNgTube = activeSubGroup ? activeSubGroup.ngTube : (activeMainGroup.ngTube || '');
  const currentSuctionCatheter = activeSubGroup ? activeSubGroup.suctionCatheter : (activeMainGroup.suctionCatheter || '');
  const currentApneicO2 = activeSubGroup ? activeSubGroup.apneicO2 : (activeMainGroup.apneicO2 || '');
  const currentApneicO2Text = activeSubGroup ? activeSubGroup.apneicO2Text : (activeMainGroup.apneicO2Text || '');
  const currentWeightKg = activeSubGroup ? activeSubGroup.weightKg : (activeMainGroup.weightKg || 0);

  const vitals = getNormalVitalSigns(activeMainGroup.id, selectedSubId);

  // Reset checked steps when the main or sub group changes
  const handleMainGroupSelect = (idx: number) => {
    setSelectedMainIdx(idx);
    const mainG = AGE_GROUPS[idx];
    if (mainG.subGroups) {
      setSelectedSubId(mainG.subGroups[0].id);
    } else {
      setSelectedSubId('');
    }
    setCheckedSteps({});
  };

  const handleSubGroupSelect = (subId: string) => {
    setSelectedSubId(subId);
    setCheckedSteps({});
  };

  // Map search query to matching age groups
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim().toLowerCase();
    if (!cleanQuery) return;

    // Direct match checking
    const matchedIndex = AGE_GROUPS.findIndex(group => 
      group.label.toLowerCase() === cleanQuery ||
      group.fullName.toLowerCase().includes(cleanQuery) ||
      group.details.toLowerCase().includes(cleanQuery)
    );

    if (matchedIndex !== -1) {
      handleMainGroupSelect(matchedIndex);
    } else {
      // Try parsing numeric age from text
      const numericVal = parseInt(cleanQuery.replace(/[^0-9]/g, ''));
      if (!isNaN(numericVal)) {
        if (cleanQuery.includes('m') || cleanQuery.includes('month')) {
          // It's in months
          if (numericVal < 6) {
            setSelectedMainIdx(0);
            setSelectedSubId(numericVal < 1 ? 'nb' : 'lt6m');
            setCheckedSteps({});
          } else if (numericVal <= 12) {
            handleMainGroupSelect(1); // 6m-12m
          } else if (numericVal <= 18) {
            handleMainGroupSelect(2); // 12m-18m
          } else {
            handleMainGroupSelect(3); // 18m-2y
          }
        } else {
          // It's in years
          if (numericVal < 1) {
            setSelectedMainIdx(0);
            setSelectedSubId('nb');
            setCheckedSteps({});
          } else if (numericVal === 1) {
            handleMainGroupSelect(2); // 12m-18m
          } else if (numericVal === 2) {
            handleMainGroupSelect(4); // 2y-3y
          } else if (numericVal >= 3 && numericVal <= 5) {
            setSelectedMainIdx(5); // 3y-5y
            setSelectedSubId(numericVal <= 4 ? '3_4y' : '5y');
            setCheckedSteps({});
          } else if (numericVal >= 6 && numericVal <= 8) {
            handleMainGroupSelect(6); // 6y-8y
          } else if (numericVal >= 8 && numericVal <= 10) {
            handleMainGroupSelect(7); // 8y-10y
          } else if (numericVal >= 10 && numericVal <= 12) {
            handleMainGroupSelect(8); // 10y-12y
          } else if (numericVal >= 12 && numericVal <= 14) {
            handleMainGroupSelect(9); // 12y-14y
          } else if (numericVal >= 14 && numericVal <= 16) {
            handleMainGroupSelect(10); // 14y-16y
          } else {
            handleMainGroupSelect(11); // 16y+
          }
        }
      }
    }
  };

  // Stopwatch effect
  useEffect(() => {
    if (isTimerActive) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerActive]);

  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setElapsedSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Checklist utilities
  const toggleStep = (stepId: string) => {
    setCheckedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const resetChecklist = () => {
    setCheckedSteps({});
  };

  // Backup/alternative tube sizes calculation
  const getEttBackupSizes = (sizeStr: string) => {
    if (sizeStr.includes('-')) {
      const parts = sizeStr.split('-');
      const low = parseFloat(parts[0]);
      const high = parseFloat(parts[1]);
      return {
        main: sizeStr,
        smaller: `${(low - 0.5).toFixed(1)}`,
        larger: `${(high + 0.5).toFixed(1)}`
      };
    }
    const val = parseFloat(sizeStr);
    if (isNaN(val)) return { main: sizeStr, smaller: 'N/A', larger: 'N/A' };
    return {
      main: sizeStr,
      smaller: (val - 0.5).toFixed(1),
      larger: (val + 0.5).toFixed(1)
    };
  };

  const ettBackup = getEttBackupSizes(currentEttSize);

  // Helper to format table cells that might have split sub-values
  const getTableCellFormatted = (group: MainAgeGroup, key: 'ettSize' | 'dlBlade' | 'glidescopeDl' | 'glidescopeLoPro' | 'glidescopeLoProStylet' | 'ettDepth' | 'bougie' | 'lma' | 'ngTube' | 'suctionCatheter') => {
    if (group.subGroups) {
      const val1 = group.subGroups[0][key];
      const val2 = group.subGroups[1][key];
      if (val1 === val2) return val1;
      return (
        <div className="flex flex-col items-center justify-center text-[10px] leading-tight py-0.5">
          <span className="font-bold text-slate-800">{val1}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">{val2}</span>
        </div>
      );
    }
    return (group as any)[key] || '--';
  };

  // Determine if newborn (NB) specifically is selected
  const isNewbornSelected = activeMainGroup.id === 'nb_6m' && (activeSubGroup ? activeSubGroup.id === 'nb' : true);

  return (
    <div id="app-container" className="min-h-screen bg-[#F1F5F9] text-[#1E293B] flex flex-col font-sans antialiased">
      
      {/* BRANDING HEADER - Hasbro Children's Hospital / Brown University Health style */}
      <header id="hospital-header" className="bg-[#8A1538] text-white py-3 md:py-4.5 px-4 md:px-8 shadow-md border-b-4 border-[#C21E56] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2.5 md:gap-3 w-full md:w-auto">
            <div className="bg-white p-2 rounded-lg md:p-2.5 md:rounded-xl text-[#8A1538] shadow-inner flex items-center justify-center flex-shrink-0">
              <HeartPulse className="w-6 h-6 md:w-8 md:h-8 animate-pulse text-[#8A1538]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="text-[9px] md:text-[11px] uppercase tracking-widest font-extrabold text-[#FFD1DC] truncate">Hasbro Children's Hospital</span>
                <span className="text-[9px] md:text-[11px] opacity-40">|</span>
                <span className="text-[9px] md:text-[11px] uppercase tracking-wider font-bold text-pink-100 truncate">BROWN UNIVERSITY HEALTH</span>
              </div>
              <h1 className="text-lg md:text-2xl font-black tracking-tight flex items-center gap-2">
                Critical Care <span className="font-light text-white/90">Airway Reference</span>
              </h1>
            </div>
          </div>
          
          {/* Quick Procedure Stopwatch */}
          <div id="procedure-timer-panel" className="bg-black/25 rounded-xl p-2 md:p-3 flex items-center gap-3 border border-white/10 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 md:w-5 md:h-5 text-amber-300" />
              <div>
                <div className="text-[8px] md:text-[9px] uppercase font-bold tracking-wider text-slate-300">Procedure Timer</div>
                <div className={`text-lg md:text-xl font-mono font-bold tracking-wider ${elapsedSeconds > 60 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                  {formatTime(elapsedSeconds)}
                </div>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button 
                id="btn-timer-toggle"
                onClick={toggleTimer}
                className={`p-1.5 md:p-2 rounded-lg text-white font-semibold transition-colors shadow-sm ${isTimerActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                title={isTimerActive ? 'Pause' : 'Start Timer'}
              >
                {isTimerActive ? <Stop className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              </button>
              <button 
                id="btn-timer-reset"
                onClick={resetTimer}
                className="p-1.5 md:p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors shadow-sm"
                title="Reset Timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* QUICK INSTRUCTIONS BANNER */}
      <div id="safety-alert-bar" className="bg-amber-50 border-b border-amber-200 text-amber-800 px-4 py-1.5 text-[11px] md:text-sm font-semibold">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span><strong>Emergency Clinical Reference Only:</strong> Verify sizes, check equipment with syringe, and adapt sizing dynamically to child weight.</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* TOP INTERACTIVE GRID FOR QUICK AGE SELECTION */}
        <section id="age-selector-section" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3.5 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 mb-4">
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-[#8A1538]" />
                Patient Age Group Selector
              </h2>
              <p className="text-[11px] md:text-xs text-slate-500">Tap to instantly load target sizes and update the emergency checklist below.</p>
            </div>

            {/* Quick search input */}
            <form id="age-search-form" onSubmit={handleSearch} className="relative flex items-center w-full md:w-auto">
              <input
                id="age-search-input"
                type="text"
                placeholder="Search age (e.g. 5y, 18m, newborn)..."
                className="w-full md:w-64 pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A1538] focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <button 
                id="btn-age-search"
                type="submit" 
                className="ml-2 px-3.5 py-2 text-xs bg-[#8A1538] text-white rounded-lg font-bold hover:bg-[#C21E56] transition-colors flex-shrink-0"
              >
                Go
              </button>
            </form>
          </div>

          {/* Consistent Sizing Age Buttons Grid */}
          <div id="age-buttons-grid" className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-1.5 md:gap-2.5">
            {AGE_GROUPS.map((group, idx) => {
              const isSelected = selectedMainIdx === idx;
              return (
                <button
                  id={`btn-age-select-${group.id}`}
                  key={group.id}
                  onClick={() => handleMainGroupSelect(idx)}
                  className={`py-2 md:py-3.5 px-1 rounded-xl text-center border transition-all flex flex-col justify-center items-center cursor-pointer ${
                    isSelected 
                      ? 'bg-[#8A1538] border-[#8A1538] text-white shadow-md font-black scale-[1.02] z-10 ring-2 ring-[#8A1538]/20' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 font-bold'
                  }`}
                >
                  <span className="text-xs md:text-sm tracking-tight">{group.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dual sub-age segments if Newborn/Infant or 3-5 Years is selected */}
          {activeMainGroup.subGroups && (
            <div id="sub-age-selector-container" className="mt-3 p-2.5 bg-rose-50/50 rounded-xl border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#8A1538]" />
                <span className="text-[11px] md:text-xs font-bold text-slate-700">Sub-variations exist for this age range:</span>
              </div>
              <div className="flex bg-slate-200/60 p-1 rounded-lg gap-1 w-full sm:w-auto">
                {activeMainGroup.subGroups.map((subg) => (
                  <button
                    id={`btn-sub-age-${subg.id}`}
                    key={subg.id}
                    onClick={() => handleSubGroupSelect(subg.id)}
                    className={`flex-1 sm:flex-none px-3 py-1 md:px-4 md:py-1.5 rounded-md text-[11px] md:text-xs font-bold transition-all cursor-pointer ${
                      selectedSubId === subg.id 
                        ? 'bg-[#8A1538] text-white shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {subg.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current Selection details */}
          <div id="current-patient-profile" className="mt-3 bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm animate-fade-in flex flex-col gap-4">
            {/* Profile and Weight Details Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <span className="font-extrabold text-slate-800 uppercase tracking-wide text-xs md:text-sm">Active Profile:</span>
                <span className="bg-[#FFD1DC] text-[#8A1538] px-3 py-1 md:px-3.5 md:py-1.5 rounded-lg font-black uppercase text-xs md:text-sm tracking-wider shadow-sm animate-fade-in">
                  {activeMainGroup.fullName} {activeSubGroup ? `• ${activeSubGroup.name}` : ''}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-wider">Est. Weight:</span>
                  <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md font-black font-mono text-xs shadow-sm">
                    {currentWeightKg} kg
                  </span>
                  <span className="text-slate-600 font-extrabold text-xs">({(currentWeightKg * 2.2).toFixed(1)} lbs)</span>
                </span>
              </div>
              <div className="text-slate-400 italic font-semibold text-xs hidden lg:block">
                Checklist inputs dynamically adjusted for this patient.
              </div>
            </div>

            {/* CRM Cardiopulmonary Vital Signs Reference Dashboard */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Activity className="w-4 h-4 text-[#8A1538] animate-pulse" />
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">CRM Reference: Normal Vital Signs by Age</h3>
                <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-1.5 py-0.5 rounded ml-auto">PALS Standards</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* 1. Normal Heart Rate (HR) */}
                <div id="vitals-hr-card" className="bg-rose-50/40 border border-rose-100/80 rounded-xl p-3 flex flex-col justify-between transition-all hover:bg-rose-50/60">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500">Normal HR <span className="text-[8px] font-normal lowercase">(awake)</span></span>
                    <HeartPulse className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  </div>
                  <div className="mt-1.5">
                    <span className="text-base md:text-lg font-black font-mono text-rose-950">{vitals.hrRange}</span>
                    <span className="text-[10px] text-rose-600/80 font-bold ml-1">bpm</span>
                  </div>
                </div>

                {/* 2. Normal Respiratory Rate (RR) */}
                <div id="vitals-rr-card" className="bg-sky-50/40 border border-sky-100/80 rounded-xl p-3 flex flex-col justify-between transition-all hover:bg-sky-50/60">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-sky-500">Normal RR</span>
                    <Wind className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  </div>
                  <div className="mt-1.5">
                    <span className="text-base md:text-lg font-black font-mono text-sky-950">{vitals.rrRange}</span>
                    <span className="text-[10px] text-sky-600/80 font-bold ml-1">/min</span>
                  </div>
                </div>

                {/* 3. Normal Systolic Blood Pressure (SBP) */}
                <div id="vitals-sbp-card" className="bg-emerald-50/40 border border-emerald-100/80 rounded-xl p-3 flex flex-col justify-between transition-all hover:bg-emerald-50/60">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500">Normal SBP</span>
                    <Activity className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  </div>
                  <div className="mt-1.5">
                    <span className="text-base md:text-lg font-black font-mono text-emerald-950">{vitals.sbpRange}</span>
                    <span className="text-[10px] text-emerald-600/80 font-bold ml-1">mmHg</span>
                  </div>
                </div>

                {/* 4. Hypotension Threshold */}
                <div id="vitals-hypotension-card" className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col justify-between transition-all hover:bg-amber-100/30">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-800">Hypotension SBP</span>
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 animate-bounce" />
                  </div>
                  <div className="mt-1.5">
                    <span className="text-base md:text-lg font-black font-mono text-rose-700">{vitals.hypotensionLimit}</span>
                    <span className="text-[10px] text-amber-800 font-bold ml-1">mmHg</span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 text-[10px] text-slate-500 italic font-semibold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>Reference represents resting physiological normal limits for: <strong className="text-[#8A1538] font-bold not-italic">{vitals.ageContext}</strong>.</span>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE CLINICAL DASHBOARD */}
        <div id="dashboard-layout-container" className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          
          {/* SIZING HIGHLIGHTS (LEFT COLUMN: lg-col-7) */}
          <div id="sizing-cards-container" className="lg:col-span-7 flex flex-col gap-4 md:gap-6">
            
            <div id="main-sizing-display-card" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              
              {/* Card Header */}
              <div className="bg-slate-900 text-white p-3.5 md:p-4.5 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-400 animate-pulse" />
                  <span className="font-black tracking-wide uppercase text-xs md:text-sm">Critical Airway Equipment by Age</span>
                </div>
                <div className="text-[10px] md:text-xs bg-slate-800 text-slate-300 font-bold px-2 md:px-2.5 py-1 rounded-md">
                  {activeMainGroup.label} {activeSubGroup ? `(${activeSubGroup.name})` : ''}
                </div>
              </div>

              {/* Dynamic Sizing Details Grouped Sections */}
              <div className="p-3.5 md:p-6 space-y-5 md:space-y-8">
                
                {/* GROUP 1: ETT & AIRWAY AUXILIARY EQUIPMENT */}
                <div id="group-ett-aux" className="space-y-3.5 md:space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-xs md:text-base font-black text-[#8A1538] uppercase tracking-wider flex items-center gap-2">
                      <EndotrachealTubeIcon className="w-4 h-4 md:w-5 md:h-5 text-[#8A1538]" />
                      ETT & Primary Placement Auxiliaries
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    
                    {/* 1. PRIMARY TUBING SIZE CARD (EXTREMELY PROMINENT WITH ETT SVG ACCENT) */}
                    <div id="card-ett-size" className="bg-gradient-to-br from-slate-50 to-pink-50/20 rounded-2xl p-4 md:p-5 border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
                      
                      {/* Tube SVG Background Accent */}
                      <div className="absolute right-[-15px] top-[-10px] opacity-[0.06] text-slate-900 pointer-events-none group-hover:scale-105 transition-transform duration-300">
                        <EndotrachealTubeIcon className="w-36 h-36" />
                      </div>

                      <div className="relative z-10">
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Cuffed ETT Size</span>
                        <div className="text-4xl md:text-5xl font-black text-[#8A1538] mt-1 tracking-tight font-mono">
                          {currentEttSize}
                        </div>
                      </div>

                      <div className="mt-3 md:mt-4 border-t border-slate-200/60 pt-2.5 md:pt-3 relative z-10">
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5">Expected Sizing Array</div>
                        <div className="grid grid-cols-3 gap-1 md:gap-1.5 text-center">
                          <div className="bg-slate-100 rounded-lg p-1.5 text-slate-600 text-[11px] md:text-xs">
                            <div className="scale-75 text-[8px] text-slate-400 font-black uppercase">Backup</div>
                            <span className="font-bold font-mono">{ettBackup.smaller}</span>
                          </div>
                          <div className="bg-[#FFD1DC]/40 rounded-lg p-1.5 text-[#8A1538] text-[11px] md:text-xs font-black border border-[#8A1538]/20">
                            <div className="scale-75 text-[8px] text-[#8A1538]/70 font-black uppercase">Target</div>
                            <span className="font-mono">{ettBackup.main}</span>
                          </div>
                          <div className="bg-slate-100 rounded-lg p-1.5 text-slate-600 text-[11px] md:text-xs">
                            <div className="scale-75 text-[8px] text-slate-400 font-black uppercase">Larger</div>
                            <span className="font-bold font-mono">{ettBackup.larger}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. ETT DEPTH CARD */}
                    <div id="card-ett-depth" className="bg-slate-50 rounded-2xl p-4 md:p-5 border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
                      
                      {/* Ruler SVG Background Accent */}
                      <div className="absolute right-[-10px] top-[-10px] opacity-[0.05] text-slate-900 pointer-events-none group-hover:scale-105 transition-transform duration-300">
                        <DepthRulerIcon className="w-32 h-32" />
                      </div>

                      <div className="relative z-10">
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">ETT Depth (at lip)</span>
                        <div className="text-4xl md:text-5xl font-black text-slate-800 mt-1 tracking-tight font-mono">
                          {currentEttDepth}<span className="text-xl md:text-2xl font-bold text-slate-500 font-sans lowercase ml-1">cm</span>
                        </div>
                        <span className="text-[11px] md:text-xs text-slate-400 font-bold block mt-1">Secure tube at center of lip line</span>
                      </div>
                      <div className="mt-3 md:mt-4 bg-amber-50 rounded-xl p-2.5 text-[10.5px] text-amber-950 border border-amber-200 flex items-center gap-2 relative z-10">
                        <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Ensure breath sounds are equal bilaterally.</span>
                      </div>
                    </div>

                  </div>

                  {/* Other critical ETT Auxiliaries: LMA, Suction, Bougie, Glidescope Stylet */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-3 md:mt-4">
                    
                    {/* LMA SIZE CARD */}
                    <div id="card-lma-size" className="bg-slate-50 rounded-xl p-3 md:p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
                      {/* LMA SVG Background Accent */}
                      <div className="absolute right-[-5px] top-[-5px] opacity-[0.04] text-slate-900 pointer-events-none group-hover:scale-105 transition-transform duration-300">
                        <LmaIcon className="w-20 h-20" />
                      </div>
                      <div className="relative z-10">
                        <span className="text-[10px] md:text-xs uppercase font-black tracking-widest text-slate-400 block">LMA Size</span>
                        <div className="text-xl md:text-2xl font-black text-slate-800 mt-0.5 md:mt-1 font-mono">{currentLma}</div>
                        <span className="text-[10px] md:text-xs text-slate-400 font-semibold mt-0.5 block">Supraglottic</span>
                      </div>
                    </div>

                    {/* SUCTION CATHETER SIZE CARD */}
                    <div id="card-suction-catheter" className="bg-slate-50 rounded-xl p-3 md:p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
                      {/* Suction SVG Background Accent */}
                      <div className="absolute right-[-5px] top-[-5px] opacity-[0.04] text-slate-900 pointer-events-none group-hover:scale-105 transition-transform duration-300">
                        <SuctionIcon className="w-20 h-20" />
                      </div>
                      <div className="relative z-10">
                        <span className="text-[10px] md:text-xs uppercase font-black tracking-widest text-slate-400 block">Suction Catheter</span>
                        <div className="text-xl md:text-2xl font-black text-slate-800 mt-0.5 md:mt-1 font-mono">{currentSuctionCatheter} <span className="text-xs font-normal">Fr</span></div>
                        <span className="text-[10px] md:text-xs text-slate-400 font-semibold mt-0.5 block">Airway suction</span>
                      </div>
                    </div>

                    {/* BOUGIE SIZE CARD */}
                    <div id="card-bougie-size" className="bg-slate-50 rounded-xl p-3 md:p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
                      {/* Bougie SVG Background Accent */}
                      <div className="absolute right-[-5px] top-[-5px] opacity-[0.04] text-slate-900 pointer-events-none group-hover:scale-105 transition-transform duration-300">
                        <BougieIcon className="w-20 h-20" />
                      </div>
                      <div className="relative z-10">
                        <span className="text-[10px] md:text-xs uppercase font-black tracking-widest text-slate-400 block">Bougie Size</span>
                        <div className="text-xl md:text-2xl font-black text-slate-800 mt-0.5 md:mt-1 font-mono">{currentBougie}</div>
                        <span className="text-[10px] md:text-xs text-slate-400 font-semibold mt-0.5 block">Tube Guide</span>
                      </div>
                    </div>

                    {/* GLIDESCOPE LOPRO STYLET */}
                    <div id="card-glidescope-stylet" className="bg-slate-50 rounded-xl p-3 md:p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
                      {/* Stylet SVG Background Accent */}
                      <div className="absolute right-[-5px] top-[-5px] opacity-[0.04] text-slate-900 pointer-events-none group-hover:scale-105 transition-transform duration-300">
                        <StyletIcon className="w-20 h-20" />
                      </div>
                      <div className="relative z-10">
                        <span className="text-[10px] md:text-xs uppercase font-black tracking-widest text-slate-400 block">LoPro Stylet</span>
                        <div className="text-xl md:text-2xl font-black text-slate-800 mt-0.5 md:mt-1 font-mono">{currentGlidescopeLoProStylet}</div>
                        <span className="text-[10px] md:text-xs text-slate-400 font-semibold mt-0.5 block">Intubation Guide</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* GROUP 2: LARYNGOSCOPY & GASTRIC TUBES */}
                <div id="group-laryngoscopy" className="space-y-3.5 md:space-y-4 pt-4 border-t border-slate-100">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-xs md:text-base font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <LaryngoscopeIcon className="w-4 h-4 md:w-5 md:h-5 text-slate-700" />
                      Laryngoscopy & Decompression
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    
                    {/* GLIDESCOPE LOPRO SPECS */}
                    <div id="card-glidescope-lopro" className="bg-slate-50 rounded-xl p-3 md:p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
                      {/* Laryngoscope SVG Background Accent */}
                      <div className="absolute right-[-5px] top-[-5px] opacity-[0.04] text-slate-900 pointer-events-none group-hover:scale-105 transition-transform duration-300">
                        <LaryngoscopeIcon className="w-20 h-20" />
                      </div>
                      <div className="relative z-10">
                        <span className="text-[10px] md:text-xs uppercase font-black tracking-widest text-slate-400 block">Glidescope LoPro</span>
                        <div className="text-lg md:text-xl font-black text-slate-800 mt-0.5 md:mt-1 font-mono">{currentGlidescopeLoPro}</div>
                        <span className="text-[10px] md:text-xs text-slate-400 font-semibold mt-0.5 block">Angulated Blade</span>
                      </div>
                    </div>

                    {/* GLIDESCOPE DL SPECS */}
                    <div id="card-glidescope-dl" className="bg-slate-50 rounded-xl p-3 md:p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
                      {/* Laryngoscope SVG Background Accent */}
                      <div className="absolute right-[-5px] top-[-5px] opacity-[0.04] text-slate-900 pointer-events-none group-hover:scale-105 transition-transform duration-300">
                        <LaryngoscopeIcon className="w-20 h-20" />
                      </div>
                      <div className="relative z-10">
                        <span className="text-[10px] md:text-xs uppercase font-black tracking-widest text-slate-400 block">Glidescope DL</span>
                        <div className="text-lg md:text-xl font-black text-slate-800 mt-0.5 md:mt-1 font-mono">{currentGlidescopeDl}</div>
                        <span className="text-[10px] md:text-xs text-slate-400 font-semibold mt-0.5 block">Direct Video Blade</span>
                      </div>
                    </div>

                    {/* DL BLADE SIZE CARD */}
                    <div id="card-dl-blade" className="bg-slate-50 rounded-xl p-3 md:p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
                      {/* Laryngoscope SVG Background Accent */}
                      <div className="absolute right-[-5px] top-[-5px] opacity-[0.04] text-slate-900 pointer-events-none group-hover:scale-105 transition-transform duration-300">
                        <LaryngoscopeIcon className="w-20 h-20" />
                      </div>
                      <div className="relative z-10">
                        <span className="text-[10px] md:text-xs uppercase font-black tracking-widest text-slate-400 block">DL Blade Size</span>
                        <div className="text-lg md:text-xl font-black text-slate-800 mt-0.5 md:mt-1 font-mono">{currentDlBlade}</div>
                        <span className="text-[10px] md:text-xs text-slate-400 font-semibold mt-0.5 block">Direct Laryngoscopy</span>
                      </div>
                    </div>

                    {/* NG TUBE SIZE CARD (LISTED LAST) */}
                    <div id="card-ng-tube" className="bg-gradient-to-br from-slate-50 to-amber-50/10 rounded-xl p-3 md:p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
                      {/* Gastric Tube SVG Background Accent */}
                      <div className="absolute right-[-5px] top-[-5px] opacity-[0.04] text-slate-900 pointer-events-none group-hover:scale-105 transition-transform duration-300">
                        <GastricTubeIcon className="w-20 h-20" />
                      </div>
                      <div className="relative z-10">
                        <span className="text-[10px] md:text-xs uppercase font-black tracking-widest text-amber-800 block">NG/OG Tube</span>
                        <div className="text-lg md:text-xl font-black text-slate-800 mt-0.5 md:mt-1 font-mono">{currentNgTube} <span className="text-xs font-normal">Fr</span></div>
                        <span className="text-[10px] md:text-xs text-amber-700/80 font-semibold mt-0.5 block">Gastric Decomp</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Conditional Note display: Only display when Newborn (NB) is selected */}
              {isNewbornSelected && (
                <div id="nb-conditional-note" className="bg-rose-50 px-4 md:px-6 py-3.5 md:py-4.5 border-t border-rose-200 text-xs text-rose-900 animate-fade-in">
                  <div className="flex gap-2.5 items-start">
                    <AlertTriangle className="w-4.5 h-4.5 text-[#8A1538] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[#8A1538] font-black uppercase tracking-wider block mb-0.5">* Note:</span>
                      <p className="font-semibold text-rose-950">
                        Consider uncuffed 2.5 ETT for premature infants or difficulty intubating with 3.0 cuffed ETT. Prepare backup equipment in direct proximity.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* DYNAMIC EMERGENCY PROCEDURAL CHECKLIST (RIGHT COLUMN: lg-col-5) */}
          <div id="checklist-panel-container" className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col justify-between">
              
              <div>
                <div className="bg-[#8A1538] text-white p-4.5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-[#FFD1DC]" />
                    <span className="font-black tracking-wide uppercase text-sm">Interactive Checklist</span>
                  </div>
                  <button 
                    id="btn-reset-checklist"
                    onClick={resetChecklist}
                    className="text-xs text-[#FFD1DC] font-bold flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                  >
                    <ListRestart className="w-4 h-4" />
                    Reset
                  </button>
                </div>

                <div className="p-3 md:p-6 flex flex-col gap-4 md:gap-5">
                  <div className="border-b border-slate-100 pb-2.5">
                    <h3 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-wider mb-0.5">Pre-oxygenation & Preparation</h3>
                    <p className="text-[10px] md:text-xs text-slate-400">Complete prior to administering induction medications</p>
                  </div>

                  <div id="checklist-items-container" className="space-y-2.5 md:space-y-3.5">
                    
                    {/* Item 1: Pre-oxygenation */}
                    <div 
                      id="item-pre-oxygenation"
                      onClick={() => toggleStep('pre-o2')} 
                      className={`p-2.5 md:p-3.5 rounded-xl border flex items-start gap-2.5 md:gap-3 cursor-pointer transition-all ${
                        checkedSteps['pre-o2'] 
                          ? 'bg-slate-50 border-slate-200 text-slate-400 line-through' 
                          : 'bg-white border-slate-200 hover:border-[#8A1538]/30 shadow-sm'
                      }`}
                    >
                      <button id="btn-check-pre-o2" className="mt-0.5 flex-shrink-0 text-[#8A1538] cursor-pointer">
                        {checkedSteps['pre-o2'] ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 fill-emerald-50" /> : <Square className="w-4.5 h-4.5 text-slate-300" />}
                      </button>
                      <div>
                        <div className="text-xs md:text-sm font-bold text-slate-800">Pre-oxygenation</div>
                        <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">Provide 100% non-rebreather mask OR 100% O₂ BMV (Bag-Valve-Mask)</p>
                      </div>
                    </div>

                    {/* Item 2: Apneic Oxygenation */}
                    <div 
                      id="item-apneic-o2"
                      onClick={() => toggleStep('apneic-o2')} 
                      className={`p-2.5 md:p-3.5 rounded-xl border flex items-start gap-2.5 md:gap-3 cursor-pointer transition-all ${
                        checkedSteps['apneic-o2'] 
                          ? 'bg-slate-50 border-slate-200 text-slate-400 line-through' 
                          : 'bg-[#FFD1DC]/10 border-red-200 hover:border-[#8A1538]/30 shadow-sm'
                      }`}
                    >
                      <button id="btn-check-apneic-o2" className="mt-0.5 flex-shrink-0 text-[#8A1538] cursor-pointer">
                        {checkedSteps['apneic-o2'] ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 fill-emerald-50" /> : <Square className="w-4.5 h-4.5 text-rose-300" />}
                      </button>
                      <div>
                        <div className="text-xs md:text-sm font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                          <span>Apneic Oxygenation</span>
                          <span className="bg-[#8A1538] text-white text-[10px] font-mono px-2 py-0.5 rounded font-black">
                            Flow: {currentApneicO2}
                          </span>
                        </div>
                        <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">
                          Keep Nasal Cannula (NC) on patient with O₂ flowing. Recommended: 
                          <strong className="text-slate-700 ml-1 underline">{currentApneicO2Text}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Item 3: Suction Catheters */}
                    <div 
                      id="item-suction-on-bed"
                      onClick={() => toggleStep('suction')} 
                      className={`p-2.5 md:p-3.5 rounded-xl border flex items-start gap-2.5 md:gap-3 cursor-pointer transition-all ${
                        checkedSteps['suction'] 
                          ? 'bg-slate-50 border-slate-200 text-slate-400 line-through' 
                          : 'bg-white border-slate-200 hover:border-[#8A1538]/30 shadow-sm'
                      }`}
                    >
                      <button id="btn-check-suction" className="mt-0.5 flex-shrink-0 text-[#8A1538] cursor-pointer">
                        {checkedSteps['suction'] ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 fill-emerald-50" /> : <Square className="w-4.5 h-4.5 text-slate-300" />}
                      </button>
                      <div>
                        <div className="text-xs md:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Suction Catheters on Bed</span>
                          <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-black font-mono">
                            {currentSuctionCatheter} Fr
                          </span>
                        </div>
                        <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">Ensure Yankauer and soft suction ({currentSuctionCatheter} Fr) are connected and immediately available on the bed.</p>
                      </div>
                    </div>

                    {/* Item 4: Blades of Correct Size */}
                    <div 
                      id="item-blades"
                      onClick={() => toggleStep('blades')} 
                      className={`p-2.5 md:p-3.5 rounded-xl border flex items-start gap-2.5 md:gap-3 cursor-pointer transition-all ${
                        checkedSteps['blades'] 
                          ? 'bg-slate-50 border-slate-200 text-slate-400 line-through' 
                          : 'bg-white border-slate-200 hover:border-[#8A1538]/30 shadow-sm'
                      }`}
                    >
                      <button id="btn-check-blades" className="mt-0.5 flex-shrink-0 text-[#8A1538] cursor-pointer">
                        {checkedSteps['blades'] ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 fill-emerald-50" /> : <Square className="w-4.5 h-4.5 text-slate-300" />}
                      </button>
                      <div>
                        <div className="text-xs md:text-sm font-bold text-slate-800">Blades of Correct Size</div>
                        <p className="text-[11px] md:text-xs text-slate-500 mt-0.5 flex flex-col gap-1">
                          <span>Verify Glidescope and/or Direct Laryngoscopy sizing:</span>
                          <span className="font-semibold text-slate-700">
                            • DL Blade Size: <span className="font-mono bg-slate-100 px-1 rounded">{currentDlBlade}</span>
                          </span>
                          <span className="font-semibold text-slate-700">
                            • Glidescope (DL): <span className="font-mono bg-slate-100 px-1 rounded">{currentGlidescopeDl}</span>
                          </span>
                          <span className="font-semibold text-slate-700">
                            • Glidescope (LoPro): <span className="font-mono bg-slate-100 px-1 rounded">{currentGlidescopeLoPro}</span>
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Item 5: ETT Sizing & Depth Confirmation */}
                    <div 
                      id="item-ett-depth"
                      onClick={() => toggleStep('ett')} 
                      className={`p-2.5 md:p-3.5 rounded-xl border flex items-start gap-2.5 md:gap-3 cursor-pointer transition-all ${
                        checkedSteps['ett'] 
                          ? 'bg-slate-50 border-slate-200 text-slate-400 line-through' 
                          : 'bg-white border-slate-200 hover:border-[#8A1538]/30 shadow-sm'
                      }`}
                    >
                      <button id="btn-check-ett" className="mt-0.5 flex-shrink-0 text-[#8A1538] cursor-pointer">
                        {checkedSteps['ett'] ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 fill-emerald-50" /> : <Square className="w-4.5 h-4.5 text-slate-300" />}
                      </button>
                      <div>
                        <div className="text-xs md:text-sm font-bold text-slate-800">ETT: Confirm Sizing and Depth</div>
                        <div className="text-[11px] md:text-xs text-slate-500 mt-1 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>Prepare planned size: <strong className="text-rose-700 font-mono text-xs md:text-sm bg-rose-50 px-1 rounded">{currentEttSize}</strong> and a half size smaller: <strong className="text-slate-700 font-mono bg-slate-100 px-1 rounded">{ettBackup.smaller}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>Check ETT cuff with syringe (if cuffed tube)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>Stylet: <strong className="text-slate-700 font-mono bg-slate-100 px-1.5 rounded">{currentGlidescopeLoProStylet}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>Expected depth: <strong className="text-[#8A1538] font-mono">{currentEttDepth} cm</strong> at the lip.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Item 6: Capnography */}
                    <div 
                      id="item-capnography"
                      onClick={() => toggleStep('capnography')} 
                      className={`p-2.5 md:p-3.5 rounded-xl border flex items-start gap-2.5 md:gap-3 cursor-pointer transition-all ${
                        checkedSteps['capnography'] 
                          ? 'bg-slate-50 border-slate-200 text-slate-400 line-through' 
                          : 'bg-white border-slate-200 hover:border-[#8A1538]/30 shadow-sm'
                      }`}
                    >
                      <button id="btn-check-capnography" className="mt-0.5 flex-shrink-0 text-[#8A1538] cursor-pointer">
                        {checkedSteps['capnography'] ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 fill-emerald-50" /> : <Square className="w-4.5 h-4.5 text-slate-300" />}
                      </button>
                      <div>
                        <div className="text-xs md:text-sm font-bold text-slate-800">Capnography Verification</div>
                        <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">Confirm placement using Colorimetric (Easy Cap) detector AND continuous end-tidal CO₂ (EtCO₂).</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Reset stats helper / Quick visual progress */}
              <div className="bg-slate-50 p-4 border-t border-slate-150 flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>Checklist Completion Status:</span>
                <span className="bg-slate-200 px-2.5 py-1 rounded-full font-black text-slate-700">
                  {Object.values(checkedSteps).filter(Boolean).length} / 6 Complete
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* FULL REFERENCE MATRIX GRID (EXACT LAYOUT TO IMAGE WITH HIGHLIGHTS) */}
        <section id="reference-matrix-section" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#8A1538] text-white py-4 px-6 border-b border-rose-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <h2 className="text-base font-black tracking-wide uppercase flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FFD1DC]" />
                Airway reference matrix
              </h2>
              <p className="text-xs text-rose-100 font-light">Hasbro Children's Hospital Critical Care Airway Sizing Chart</p>
            </div>
            <div className="text-xs bg-black/20 text-white/90 border border-white/10 rounded px-2.5 py-1 font-bold">
              Highlighted column: {activeMainGroup.fullName}
            </div>
          </div>

          <div className="bg-slate-50 border-b border-slate-200 py-1.5 px-4 text-[10px] text-slate-500 flex justify-between items-center md:hidden">
            <span className="flex items-center gap-1">Swipe/Scroll horizontally to view all ages →</span>
            <span className="bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">12 Columns</span>
          </div>

          <div id="table-scroll-wrapper" className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold text-xs uppercase border-b border-slate-200">
                  <th className="py-4 px-4 sticky left-0 bg-slate-50 z-20 border-r border-slate-200 w-48 text-slate-900 font-extrabold font-mono text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Equipment / Age</th>
                  {AGE_GROUPS.map((group, idx) => {
                    const isSelected = selectedMainIdx === idx;
                    return (
                      <th 
                        key={group.id} 
                        onClick={() => handleMainGroupSelect(idx)}
                        className={`py-4 px-1 text-center font-black cursor-pointer border-r border-slate-100 transition-all text-sm select-none ${
                          isSelected ? 'bg-[#FFD1DC]/40 text-[#8A1538] border-x-2 border-[#8A1538]/30 font-black' : 'hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-extrabold text-xs tracking-tight">{group.label}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="text-xs">
                
                {/* 1. Cuffed ETT Size Row */}
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-4 sticky left-0 bg-slate-50 font-bold text-slate-800 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    Cuffed ETT size*
                  </td>
                  {AGE_GROUPS.map((group, idx) => (
                    <td 
                      key={group.id}
                      onClick={() => handleMainGroupSelect(idx)}
                      className={`py-3 px-1 text-center font-mono font-extrabold cursor-pointer transition-colors border-r border-slate-100 ${
                        selectedMainIdx === idx ? 'bg-[#FFD1DC]/20 text-[#8A1538] font-black border-x-2 border-slate-200 text-sm' : 'text-slate-700'
                      }`}
                    >
                      {getTableCellFormatted(group, 'ettSize')}
                    </td>
                  ))}
                </tr>

                {/* 2. ETT Depth Row */}
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-4 sticky left-0 bg-slate-50 font-bold text-slate-800 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    ETT depth (cm at lip)
                  </td>
                  {AGE_GROUPS.map((group, idx) => (
                    <td 
                      key={group.id}
                      onClick={() => handleMainGroupSelect(idx)}
                      className={`py-3 px-1 text-center font-mono font-extrabold cursor-pointer transition-colors border-r border-slate-100 ${
                        selectedMainIdx === idx ? 'bg-[#FFD1DC]/20 text-[#8A1538] font-black border-x-2 border-slate-200 text-sm' : 'text-slate-700'
                      }`}
                    >
                      {getTableCellFormatted(group, 'ettDepth')}
                    </td>
                  ))}
                </tr>

                {/* 3. LMA Row */}
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-4 sticky left-0 bg-slate-50 font-bold text-slate-800 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    LMA size
                  </td>
                  {AGE_GROUPS.map((group, idx) => (
                    <td 
                      key={group.id}
                      onClick={() => handleMainGroupSelect(idx)}
                      className={`py-3 px-1 text-center font-mono cursor-pointer transition-colors border-r border-slate-100 ${
                        selectedMainIdx === idx ? 'bg-[#FFD1DC]/20 text-[#8A1538] font-bold border-x-2 border-slate-200 text-sm' : 'text-slate-600'
                      }`}
                    >
                      {getTableCellFormatted(group, 'lma')}
                    </td>
                  ))}
                </tr>

                {/* 4. Suction Catheter Row */}
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-4 sticky left-0 bg-slate-50 font-bold text-slate-800 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    Suction Catheter (Fr)
                  </td>
                  {AGE_GROUPS.map((group, idx) => (
                    <td 
                      key={group.id}
                      onClick={() => handleMainGroupSelect(idx)}
                      className={`py-3 px-1 text-center font-mono cursor-pointer transition-colors border-r border-slate-100 ${
                        selectedMainIdx === idx ? 'bg-[#FFD1DC]/20 text-[#8A1538] font-bold border-x-2 border-slate-200 text-sm' : 'text-slate-600'
                      }`}
                    >
                      {getTableCellFormatted(group, 'suctionCatheter')}
                    </td>
                  ))}
                </tr>

                {/* 5. Bougie Row */}
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-4 sticky left-0 bg-slate-50 font-bold text-slate-800 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    Bougie Selection
                  </td>
                  {AGE_GROUPS.map((group, idx) => (
                    <td 
                      key={group.id}
                      onClick={() => handleMainGroupSelect(idx)}
                      className={`py-3 px-1 text-center font-mono cursor-pointer transition-colors border-r border-slate-100 ${
                        selectedMainIdx === idx ? 'bg-[#FFD1DC]/20 text-[#8A1538] font-bold border-x-2 border-slate-200 text-sm' : 'text-slate-600'
                      }`}
                    >
                      {getTableCellFormatted(group, 'bougie')}
                    </td>
                  ))}
                </tr>

                {/* 6. Glidescope LoPro Stylet Row */}
                <tr className="border-b border-slate-150 hover:bg-slate-50/50">
                  <td className="py-3 px-4 sticky left-0 bg-slate-50 font-bold text-slate-800 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    GS LoPro Stylet
                  </td>
                  {AGE_GROUPS.map((group, idx) => (
                    <td 
                      key={group.id}
                      onClick={() => handleMainGroupSelect(idx)}
                      className={`py-3 px-1 text-center font-mono cursor-pointer transition-colors border-r border-slate-100 ${
                        selectedMainIdx === idx ? 'bg-[#FFD1DC]/20 text-[#8A1538] font-bold border-x-2 border-slate-200 text-sm' : 'text-slate-600'
                      }`}
                    >
                      {getTableCellFormatted(group, 'glidescopeLoProStylet')}
                    </td>
                  ))}
                </tr>

                {/* 7. Glidescope LoPro Row */}
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-4 sticky left-0 bg-slate-50 font-bold text-slate-800 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    Glidescope (LoPro)
                  </td>
                  {AGE_GROUPS.map((group, idx) => (
                    <td 
                      key={group.id}
                      onClick={() => handleMainGroupSelect(idx)}
                      className={`py-3 px-1 text-center font-mono cursor-pointer transition-colors border-r border-slate-100 ${
                        selectedMainIdx === idx ? 'bg-[#FFD1DC]/20 text-[#8A1538] font-bold border-x-2 border-slate-200 text-sm' : 'text-slate-600'
                      }`}
                    >
                      {getTableCellFormatted(group, 'glidescopeLoPro')}
                    </td>
                  ))}
                </tr>

                {/* 8. Glidescope DL Row */}
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-4 sticky left-0 bg-slate-50 font-bold text-slate-800 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    Glidescope (DL)
                  </td>
                  {AGE_GROUPS.map((group, idx) => (
                    <td 
                      key={group.id}
                      onClick={() => handleMainGroupSelect(idx)}
                      className={`py-3 px-1 text-center font-mono cursor-pointer transition-colors border-r border-slate-100 ${
                        selectedMainIdx === idx ? 'bg-[#FFD1DC]/20 text-[#8A1538] font-bold border-x-2 border-slate-200 text-sm' : 'text-slate-600'
                      }`}
                    >
                      {getTableCellFormatted(group, 'glidescopeDl')}
                    </td>
                  ))}
                </tr>

                {/* 9. DL Blade Size Row */}
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-4 sticky left-0 bg-slate-50 font-bold text-slate-800 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    DL Blade size
                  </td>
                  {AGE_GROUPS.map((group, idx) => (
                    <td 
                      key={group.id}
                      onClick={() => handleMainGroupSelect(idx)}
                      className={`py-3 px-1 text-center font-mono cursor-pointer transition-colors border-r border-slate-100 ${
                        selectedMainIdx === idx ? 'bg-[#FFD1DC]/20 text-[#8A1538] font-bold border-x-2 border-slate-200 text-sm' : 'text-slate-600'
                      }`}
                    >
                      {getTableCellFormatted(group, 'dlBlade')}
                    </td>
                  ))}
                </tr>

                {/* 10. NG Tube Row - LISTED LAST */}
                <tr className="border-b border-slate-300 hover:bg-slate-50/50">
                  <td className="py-3 px-4 sticky left-0 bg-slate-50 font-bold text-slate-800 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    NG Tube (Fr)
                  </td>
                  {AGE_GROUPS.map((group, idx) => (
                    <td 
                      key={group.id}
                      onClick={() => handleMainGroupSelect(idx)}
                      className={`py-3 px-1 text-center font-mono cursor-pointer transition-colors border-r border-slate-100 ${
                        selectedMainIdx === idx ? 'bg-[#FFD1DC]/20 text-[#8A1538] font-bold border-x-2 border-slate-200 text-sm' : 'text-slate-600'
                      }`}
                    >
                      {getTableCellFormatted(group, 'ngTube')}
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>

          {/* Table Footer Guideline */}
          <div id="table-footnote-panel" className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500">
            <div className="flex flex-col gap-2">
              {isNewbornSelected && (
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-rose-950 flex gap-2 items-start animate-fade-in">
                  <AlertTriangle className="w-4 h-4 text-[#8A1538] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#8A1538] font-black uppercase tracking-wider block mb-0.5">* Note:</span>
                    <span className="font-semibold text-rose-950">
                      Consider uncuffed 2.5 ETT for premature infants or difficulty intubating with 3.0 cuffed ETT. Prepare backup equipment in direct proximity.
                    </span>
                  </div>
                </div>
              )}
              <span className="text-[11px] text-slate-400">Reference: Hasbro Children's Hospital Pediatric Airway Equipment Standard Protocol. Designed for ED, PICU, and LifePACT Teams.</span>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer id="app-footer" className="bg-slate-900 text-slate-400 py-6 px-6 border-t border-slate-800 mt-auto text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Emergency Reference Active • Hasbro Children's Critical Care</span>
          </div>
          <div>
            <span>Pediatric Airway Reference Calculator • Hasbro Children's Critical Care</span>
          </div>
          <div className="text-[10px] text-slate-600">
            For professional clinical use. Always double check values.
          </div>
        </div>
      </footer>

    </div>
  );
}
