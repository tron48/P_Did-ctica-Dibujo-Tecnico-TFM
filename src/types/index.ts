export type NavTab = 'dashboard' | 'situaciones-aprendizaje' | 'calendario-temporizacion' | 'evaluacion-rubricas' | 'banco-actividades' | 'mapa-curricular';

export interface TeacherProfile {
  name: string;
  role: string;
  center: string;
  department: string;
  subject: string;
  framework: string;
  academicYear: string;
  hours: string;
  avatarUrl?: string;
}

export interface CompetenciaEspecifica {
  id: string;
  code: string;
  title: string;
  description: string;
  checked: boolean;
}

export interface CriterioEvaluacion {
  id: string;
  code: string;
  title: string;
  description?: string;
  highlighted?: boolean;
  checked: boolean;
}

export interface SaberBasico {
  id: string;
  block: string;
  title: string;
  items: string[];
}

export interface CompetenciaClave {
  code: string;
  name: string;
  active: boolean;
}

export interface SdaData {
  id: string;
  number: string;
  code: string;
  title: string;
  educationalLevel: string;
  timing: string;
  quarter: number;
  totalSessions: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  autoLinkedToPrev?: boolean; // if true, starts next school day after previous Sda ends
  finalProduct: {
    format: string;
    description: string;
    context: string;
  };
  prototype: {
    title: string;
    type: string;
    description: string;
    imageUrl: string;
  };
  competenciasEspecificas: CompetenciaEspecifica[];
  criteriosEvaluacion: CriterioEvaluacion[];
  saberesBasicos: string[];
  competenciasClave: CompetenciaClave[];
  dua: {
    pauta1: {
      title: string;
      description: string;
      tags: string[];
    };
    pauta2: {
      title: string;
      description: string;
      tags: string[];
    };
  };
  status: 'draft' | 'active' | 'completed' | 'planned';
}

export interface CalendarDay {
  day: number;
  month: string;
  year: number;
  weekday: string;
  dateStr?: string;
  isCurrentMonth: boolean;
  isHoliday?: boolean;
  holidayName?: string;
  isNoClass?: boolean;
  lessonId?: string;
  lessonLabel?: string;
  saType?: string;
  saTitle?: string;
  saColor?: string;
  selected?: boolean;
}

export interface DidacticMilestone {
  sessionRange: string;
  dateRange: string;
  title: string;
  description: string;
  icon: string;
  criteria: string;
  competency: string;
  hours: number;
  isFinalEvaluation?: boolean;
}

export interface RubricLevel {
  level: number;
  name: string;
  pointsRange: string;
  score: number;
  description: string;
  tag: string;
  tagIcon: string;
  borderColorClass: string;
  badgeBgClass: string;
}

export interface ActivityResource {
  id: string;
  title: string;
  description: string;
  block: string;
  blockCode: string;
  difficulty: 'Inicial / Nivel 1' | 'Dificultad Media' | 'Avanzada';
  difficultyClass: string;
  sessions: number;
  format: string;
  imageUrl: string;
  criteria: string[];
  specs: {
    tool: string;
    scale: string;
  };
  category: 'format' | 'b1' | 'b2' | 'b2-ax' | 'b3';
  has3dSim?: boolean;
  hasRubric?: boolean;
  isVectorial?: boolean;
}

export interface CompetencyRow {
  id: string;
  ceId: string;
  criterionId: string;
}

export interface SaberRow {
  id: string;
  blockId: string;
  saberId: string;
  subblockId: string;
}

export interface CurriculumCEOption {
  id: string;
  code: string;
  label: string;
  criteria: {
    id: string;
    code: string;
    label: string;
    perfilSalida: string;
  }[];
}

export interface CurriculumBlockOption {
  id: string;
  code: string;
  label: string;
  saberes: {
    id: string;
    label: string;
    subbloques: string[];
  }[];
}

export interface Student {
  id: string;
  name: string;
  group?: string;
}

export interface StudentGradeRecord {
  studentId: string;
  studentName: string;
  // criterionId or code -> level (1: Insuficiente, 2: Suficiente, 3: Notable, 4: Sobresaliente)
  scores: Record<string, number>;
  notes?: string;
}

export interface SdaTemplate {
  id: string;
  badge: string;
  title: string;
  description: string;
  quarter: number;
  totalSessions: number;
  finalProduct: {
    format: string;
    description: string;
    context: string;
  };
  prototype: {
    title: string;
    type: string;
    description: string;
    imageUrl: string;
  };
  ceCodes: string[];
  criterionCodes: string[];
  saberes: string[];
  dua: {
    pauta1: {
      title: string;
      description: string;
      tags: string[];
    };
    pauta2: {
      title: string;
      description: string;
      tags: string[];
    };
  };
}

