import type {
  SdaData,
  CalendarDay,
  DidacticMilestone,
  RubricLevel,
  ActivityResource,
  TeacherProfile,
  Student,
  StudentGradeRecord,
  SdaTemplate
} from '../types/index.ts';
import { cascadeAllSdas } from '../utils/calendarScheduler.ts';

export const DEFAULT_TEACHER_PROFILE: TeacherProfile = {
  name: 'Tomás Rodríguez Campos',
  role: 'Catedrático de Dibujo Técnico',
  center: 'IES Santa Eulalia · Mérida',
  department: 'Artes Plásticas y Visuales',
  subject: 'Dibujo Técnico I (1.º Bach.)',
  framework: 'Decreto 110/2022 LOMLOE Extremadura',
  academicYear: '2027–2028',
  hours: '4 h/semana · 140 h anuales',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANya4rUoouoQ8zzVxEEA9OQ0zK6JxYoiHhtHb9ypu58KzWH4RTsYBmt23Co9rx0oXCn0jdT3aabCkCZ2VkXeWGe5H9-9Z1-ZChzlANvcwfChH-kqjY1cHc7DXoIhd5cZIixPyb8kp2JFhC9eJS45rF1dINrsDG-O034GdpdAG7zw6LaxtsZDVh2ZTzM7cmtsTlMo7jtX6O3LFhv25l-rRvsZaaPwUUCGOiyn9vwJLwTv1903gUFTm9'
};

export const RAW_INITIAL_SDAS: SdaData[] = [
  {
    id: 'sda-1',
    number: '01',
    code: 'SDA.DT1.01',
    title: 'SDA 1: El trazado geométrico en el patrimonio arquitectónico de Extremadura',
    educationalLevel: '1.º Bachillerato',
    timing: '20 ses.',
    quarter: 1,
    totalSessions: 20,
    startDate: '2027-09-15',
    autoLinkedToPrev: false,
    finalProduct: {
      format: 'Formato A3 Técnico',
      description: 'Planimetría y trazado a tinta de arcos, molduras y enlaces del Teatro Romano de Mérida.',
      context: 'Patrimonio arquitectónico e histórico emeritense'
    },
    prototype: {
      title: 'Levantamiento Geométrico del Frente Escénico Romano',
      type: 'Tinta & Portaminas',
      description: 'Análisis métrico de tangencias y enlaces geométricos en capiteles y entablamentos corintios.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwPdsjlFqCK79szLrqjS6w9XzXuB1fp4H2xoV3tO_rWTv2bPonnAZKNrK3qhU1IOWCxvzeoLC6m8imz1z6wdgPkEoQwWbioBRkKejR7Nb5bYOpjaFSWWWfxMQPm1SrCC4uHqWVxPGFKJ7ZYPzrvJAOK-cY2DxcBCb6UPym3laDz_VHr4_AVUVRJCQtdcn_2f89GNKxejy-aoLbGsHRgm7xrH99qToSjmznPEdfU55LidYgbh9iaVwx'
    },
    competenciasEspecificas: [
      {
        id: 'ce1',
        code: 'CE.DT.1',
        title: 'Fundamentos Geométrico-Métricos',
        description: 'Resolver problemas geométricos aplicando fundamentos métricos en construcciones planas para proyectar soluciones técnicas.',
        checked: true
      },
      {
        id: 'ce2',
        code: 'CE.DT.2',
        title: 'Sistemas de Representación Espacial',
        description: 'Representar formas tridimensionales sobre planos bidimensionales mediante proyección diédrica ortogonal.',
        checked: true
      },
      {
        id: 'ce4',
        code: 'CE.DT.4',
        title: 'Normalización y Planos Industriales',
        description: 'Elaborar croquis y planos normalizados aplicando normas UNE e ISO.',
        checked: false
      }
    ],
    criteriosEvaluacion: [
      {
        id: 'cr11',
        code: '1.1',
        title: 'Trazados geométricos básicos de polígonos y tangencias.',
        checked: true
      },
      {
        id: 'cr12',
        code: '1.2',
        title: 'Curvas técnicas y cónicas aplicadas al patrimonio arquitectónico.',
        checked: true
      },
      {
        id: 'cr13',
        code: '1.3',
        title: 'Transformaciones geométricas planas (giro, simetría y homotecia).',
        checked: true
      }
    ],
    saberesBasicos: [
      'Lugares geométricos fundamentales (mediatrices, bisectrices y arco capaz)',
      'Polígonos regulares inscritos y con lado conocido',
      'Propiedades de tangencias y enlaces entre rectas y circunferencias',
      'Curvas técnicas: óvalos y ovoides en arcos monumentales'
    ],
    competenciasClave: [
      { code: 'STEM1', name: 'Método científico y rigor métrico', active: true },
      { code: 'STEM2', name: 'Resolución espacial y geométrica', active: true },
      { code: 'CCEC1', name: 'Apreciación del patrimonio arquitectónico de Extremadura', active: true }
    ],
    dua: {
      pauta1: {
        title: 'Pauta 1 · Múltiples formas de representación',
        description: 'Fotografías de alta resolución del monumento junto con esquemas vectoriales de las tangencias.',
        tags: ['Fotogrametría', 'Esquemas vectoriales']
      },
      pauta2: {
        title: 'Pauta 2 · Acción y Expresión',
        description: 'Plantillas con arcos guía y centros de curvatura premarcados para andamiaje inicial.',
        tags: ['Andamiaje progresivo', 'Guías de centros']
      }
    },
    status: 'planned'
  },
  {
    id: 'sda-2',
    number: '02',
    code: 'SDA.DT1.02',
    title: 'SDA 2: Geometría y Normalización en el Diseño Industrial Extremeño',
    educationalLevel: '1.º Bachillerato',
    timing: '16 ses.',
    quarter: 2,
    totalSessions: 16,
    autoLinkedToPrev: true,
    finalProduct: {
      format: 'Formato A3',
      description: 'Lámina técnica normalizada en formato A3 con vistas ortogonales, cortes y acotación completa de una pieza de maquinaria agrícola.',
      context: 'Contexto agroindustrial comarcal (Vegas Altas / Tierra de Barros)'
    },
    prototype: {
      title: 'Prototipo de Soporte de Chasis Agrícola',
      type: 'CAD & Papel',
      description: 'Pieza fundida con taladros pasantes, nervios y vaciados para verificación de tolerancias.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDknP13Gmpt7PTouIOYtqnsntjf4H-nvSCHWhKtpSvA1YemGasI1UR34np68rLvofQuAX76sE-3199kM4QNUDK6FbPrgWJd1A7MqTPv6_fMWLRmV4e5c0nHMxQIClWW7LP12PkfHsEmOjocuMilEeZtBQFm625cIgTOjnDZmEZVQAu27ZA7PUqoTXZ1WoX3TBbfLBmFM-NKpTrgwOo0CtCT86UDoTII2I8UshIiA2gH5uF-nOF5Kk5V'
    },
    competenciasEspecificas: [
      {
        id: 'ce1',
        code: 'CE.DT.1',
        title: 'Fundamentos Geométrico-Métricos',
        description: 'Resolver problemas geométricos aplicando fundamentos métricos en construcciones planas para proyectar soluciones técnicas.',
        checked: true
      },
      {
        id: 'ce4',
        code: 'CE.DT.4',
        title: 'Normalización y Planos Industriales',
        description: 'Elaborar croquis y planos normalizados aplicando normas UNE e ISO, reconociendo el lenguaje gráfico universal de la ingeniería.',
        checked: true
      },
      {
        id: 'ce2',
        code: 'CE.DT.2',
        title: 'Sistemas de Representación Espacial',
        description: 'Representar formas tridimensionales sobre planos bidimensionales mediante proyección diédrica ortogonal y perspectivas axonométricas normalizadas.',
        checked: false
      },
      {
        id: 'ce3',
        code: 'CE.DT.3',
        title: 'Desarrollos e Intersecciones',
        description: 'Calcular verdaderas magnitudes, giros, abatimientos y desarrollos de poliedros y superficies de revolución.',
        checked: false
      },
      {
        id: 'ce5',
        code: 'CE.DT.5',
        title: 'Diseño Asistido por Ordenador (CAD)',
        description: 'Utilizar aplicaciones CAD 2D/3D como herramienta de documentación técnica, modelado y validación geométrica.',
        checked: false
      }
    ],
    criteriosEvaluacion: [
      {
        id: 'cr11',
        code: '1.1',
        title: 'Trazados geométricos básicos de polígonos y tangencias.',
        checked: true
      },
      {
        id: 'cr12',
        code: '1.2',
        title: 'Curvas técnicas y cónicas aplicadas al diseño de componentes.',
        checked: true
      },
      {
        id: 'cr41',
        code: '4.1',
        title: 'Acotación según normas vigentes',
        description: 'Acotar figuras y planos según las normas UNE e ISO vigentes, garantizando la legibilidad técnica y su fabricación real.',
        highlighted: true,
        checked: true
      },
      {
        id: 'cr42',
        code: '4.2',
        title: 'Representar vistas diédricas normalizadas con cortes y secciones.',
        checked: true
      },
      {
        id: 'cr21',
        code: '2.1',
        title: 'Determinar la posición relativa y distancias entre elementos geométricos en el sistema diédrico.',
        checked: false
      }
    ],
    saberesBasicos: [
      'Formatos de papel normalizados (Serie A)',
      'Líneas normalizadas y jerarquía de trazo',
      'Escalas normalizadas (UNE-EN ISO 5455)',
      'Sistemas de acotación funcional y de fabricación',
      'Cortes totales, semicortes y roturas normalizadas'
    ],
    competenciasClave: [
      { code: 'STEM1', name: 'Método científico', active: true },
      { code: 'STEM2', name: 'Resolución espacial', active: true },
      { code: 'CD2', name: 'Entorno CAD', active: true },
      { code: 'CPSAA1.1', name: 'Rigor métrico', active: true },
      { code: 'CC3', name: 'Impacto social y productivo en la región', active: true }
    ],
    dua: {
      pauta1: {
        title: 'Pauta 1 · Múltiples formas de representación',
        description: 'Visualización simultánea mediante croquizado tradicional a mano alzada, proyección ortogonal asistida por CAD 2D/3D (LibreCAD / FreeCAD) y modelos tridimensionales interactivos.',
        tags: ['CAD 3D interactivo', 'Códigos QR a despieces']
      },
      pauta2: {
        title: 'Pauta 2 · Acción y Expresión (Andamiaje)',
        description: 'Disposición de plantillas guía con retículas milimetradas preimpresas, cajetines normalizados UNE semi-completados y hojas de autoverificación para acotación.',
        tags: ['Rúbrica de auto-revisión', 'Guía de trazos escalonada']
      }
    },
    status: 'planned'
  },
  {
    id: 'sda-3',
    number: '03',
    code: 'SDA.DT1.03',
    title: 'SDA 3: Perspectiva axonométrica isométrica de un stand ferial de artesanía emeritense',
    educationalLevel: '1.º Bachillerato',
    timing: '16 ses.',
    quarter: 3,
    totalSessions: 16,
    autoLinkedToPrev: true,
    finalProduct: {
      format: 'Formato A3 + 3D CAD',
      description: 'Perspectiva isométrica normalizada con sección al cuarto y modelado tridimensional asistido por ordenador.',
      context: 'Feria de Artesanía y Diseño de Mérida'
    },
    prototype: {
      title: 'Stand Ferial Modular en Isométrica Normalizada',
      type: 'CAD 3D & Isométrica',
      description: 'Estructura modular con coeficientes de reducción normalizados (0.816).',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjNnz12VmunRx3V6ShKWNbF5AsqsG_QSGvOhQTR4X7zaQVBnpTNVDJJ5-SCqfYFyRUn88dm8YSzw-rFMR1tB49E5DrgQWZomyUu_RJQs_rFzjJAk9RXR2nu-yDMf8eQMk6ZZ2djRi489jBy1BVX9Z3Jxp0WUcvcGj4syxmfSE-jT4FpdlWbk7izDY1di85ptvELIiEySad5BMg0JGoQ0G8xyEy-uB-OYKvCO57_rADtWFoXQf2r7y3'
    },
    competenciasEspecificas: [
      {
        id: 'ce2',
        code: 'CE.DT.2',
        title: 'Sistemas de Representación Espacial',
        description: 'Representar formas tridimensionales mediante perspectivas axonométricas normalizadas.',
        checked: true
      },
      {
        id: 'ce3',
        code: 'CE.DT.3',
        title: 'Desarrollos e Intersecciones',
        description: 'Calcular verdaderas magnitudes, giros y abatimientos en perspectivas axonométricas.',
        checked: true
      },
      {
        id: 'ce5',
        code: 'CE.DT.5',
        title: 'Diseño Asistido por Ordenador (CAD)',
        description: 'Utilizar aplicaciones CAD 2D/3D como herramienta de documentación técnica y modelado.',
        checked: true
      }
    ],
    criteriosEvaluacion: [
      {
        id: 'cr22',
        code: '2.2',
        title: 'Construir perspectivas isométricas con y sin reducción.',
        checked: true
      },
      {
        id: 'cr31',
        code: '3.1',
        title: 'Representar piezas con cortes al cuarto en axonométrico.',
        checked: true
      },
      {
        id: 'cr51',
        code: '5.1',
        title: 'Modelar geométricamente conjuntos con CAD 2D/3D.',
        checked: true
      }
    ],
    saberesBasicos: [
      'Fundamentos de la perspectiva axonométrica: isométrica y dimétrica',
      'Elipses isométricas en las tres caras axonométricas',
      'Corte al cuarto y rayado normalizado a 45°',
      'Modelado 3D asistido por ordenador (FreeCAD/LibreCAD)'
    ],
    competenciasClave: [
      { code: 'STEM2', name: 'Resolución espacial tridimensional', active: true },
      { code: 'CD1', name: 'Diseño vectorial y modelado digital', active: true },
      { code: 'CCEC2', name: 'Creación y diseño funcional para eventos', active: true }
    ],
    dua: {
      pauta1: {
        title: 'Pauta 1 · Múltiples formas de representación',
        description: 'Modelos digitales 3D giratorios en pantalla junto con plantilla isométrica de referencia.',
        tags: ['Modelado 3D rotatorio', 'Retícula isométrica']
      },
      pauta2: {
        title: 'Pauta 2 · Acción y Expresión',
        description: 'Guía visual de trazado paso a paso para el corte al cuarto y cálculo de reducciones.',
        tags: ['Guía paso a paso', 'Fórmulas simplificadas']
      }
    },
    status: 'planned'
  }
];

export const INITIAL_SDAS: SdaData[] = cascadeAllSdas(RAW_INITIAL_SDAS);

export const INITIAL_SDA_1: SdaData = INITIAL_SDAS[0];
export const INITIAL_SDA_2: SdaData = INITIAL_SDAS[1];
export const INITIAL_SDA_3: SdaData = INITIAL_SDAS[2];

export const DIDACTIC_MILESTONES: DidacticMilestone[] = [
  {
    sessionRange: 'Sesión 1 - 4',
    dateRange: 'Fase Inicial',
    title: 'Introducción teórica, conceptos UNE y croquizado',
    description: 'Manejo de útiles de precisión, tipos de líneas normalizadas (UNE-EN ISO 128) y croquizado a mano alzada de piezas poliédricas.',
    icon: 'edit',
    criteria: 'Crit. 2.1',
    competency: 'CE 2',
    hours: 4
  },
  {
    sessionRange: 'Sesión 5 - 10',
    dateRange: 'Fase Desarrollo',
    title: 'Vistas diédricas normalizadas y trazado técnico',
    description: 'Alzado, planta y perfil. Correspondencia visual directa y trazado con portaminas 0.5 HB/2H y tinta calibrada.',
    icon: 'architecture',
    criteria: 'Crit. 2.2',
    competency: 'CE 3',
    hours: 6
  },
  {
    sessionRange: 'Sesión 11 - 14',
    dateRange: 'Fase Normalización',
    title: 'Acotación funcional y cortes por plano secante',
    description: 'Cotas de posición y dimensión sin redundancia. Secciones longitudinales y rayado técnico a 45°.',
    icon: 'straighten',
    criteria: 'Crit. 2.3',
    competency: 'D. 110/2022',
    hours: 4
  },
  {
    sessionRange: 'Sesión 15 - 16',
    dateRange: 'Fase Evaluación',
    title: 'Entrega Lámina A3 y Coevaluación con Rúbrica',
    description: 'Revisión técnica de rotulación, cajetín oficial de Extremadura y rúbrica formativa entre pares.',
    icon: 'verified',
    criteria: 'Crit. 1.2',
    competency: 'Rúbrica R-SDA2',
    hours: 2,
    isFinalEvaluation: true
  }
];

export const RUBRIC_LEVELS: RubricLevel[] = [
  {
    level: 4,
    name: 'Excelente',
    pointsRange: '10 - 9 pts',
    score: 9.5,
    description: 'Precisión milimétrica en aristas vistas y ocultas (jerarquía de grosores 0.8/0.4 mm). Acotación normalizada sin redundancias. Rotulación normalizada según norma UNE 1034 impecable y cajetín completo.',
    tag: 'Criterio 3.1 & 3.2 Dominado',
    tagIcon: 'verified',
    borderColorClass: 'border-l-secondary-container',
    badgeBgClass: 'bg-secondary-fixed text-on-secondary-fixed'
  },
  {
    level: 3,
    name: 'Notable',
    pointsRange: '8 - 7 pts',
    score: 7.8,
    description: 'Trazado técnico limpio con ligeras desviaciones de grosor en trazos discontinuos. Acotación correcta respetando distancias mínimas con pequeños descuidos en flechas de cota o separación de texto.',
    tag: 'Solvencia técnica demostrada',
    tagIcon: 'check_circle',
    borderColorClass: 'border-l-secondary',
    badgeBgClass: 'bg-surface-container-high text-on-surface-variant'
  },
  {
    level: 2,
    name: 'Aprobado',
    pointsRange: '6 - 5 pts',
    score: 5.5,
    description: 'Comprensión espacial de las vistas diédricas básicas, pero persisten errores menores en tipos de líneas, cotas cruzadas con aristas o empalmes geométricos inexactos (±1mm).',
    tag: 'Requiere corrección guiada',
    tagIcon: 'info',
    borderColorClass: 'border-l-outline-variant',
    badgeBgClass: 'bg-surface-container text-on-surface-variant'
  },
  {
    level: 1,
    name: 'Insuficiente',
    pointsRange: '< 5 pts',
    score: 3.5,
    description: 'Confusión severa en correspondencia de vistas en planta y alzado, incumplimiento manifiesto de normas de acotación básica y falta notable de limpieza o pulcritud en el soporte.',
    tag: 'Plan de recuperación requerido',
    tagIcon: 'warning',
    borderColorClass: 'border-l-error',
    badgeBgClass: 'bg-error-container text-on-error-container'
  }
];

export const ACTIVITY_RESOURCES: ActivityResource[] = [
  {
    id: 'act-1',
    title: 'Trazado y enlace de tangencias en el logotipo de la Red de Parques Naturales de Extremadura',
    description: 'Determinación de centros de curvatura, puntos de tangencia precisos y enlace armónico con el Monfragüe y Cornalvo.',
    block: 'Bloque 1 · Métrica',
    blockCode: 'B1',
    difficulty: 'Dificultad Media',
    difficultyClass: 'bg-tertiary-fixed/40 text-on-tertiary-fixed-variant',
    sessions: 3,
    format: 'A4 DIN',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwPdsjlFqCK79szLrqjS6w9XzXuB1fp4H2xoV3tO_rWTv2bPonnAZKNrK3qhU1IOWCxvzeoLC6m8imz1z6wdgPkEoQwWbioBRkKejR7Nb5bYOpjaFSWWWfxMQPm1SrCC4uHqWVxPGFKJ7ZYPzrvJAOK-cY2DxcBCb6UPym3laDz_VHr4_AVUVRJCQtdcn_2f89GNKxejy-aoLbGsHRgm7xrH99qToSjmznPEdfU55LidYgbh9iaVwx',
    criteria: ['CE 1.1 · Geometría', 'Crit. 1.1.2'],
    specs: {
      tool: 'Compás + Regla 0.4mm',
      scale: 'Escala 1:1'
    },
    category: 'b1',
    isVectorial: true
  },
  {
    id: 'act-2',
    title: 'Determinación de la verdadera magnitud y trazas de un plano oblicuo en Sistema Diédrico',
    description: 'Abatimiento sobre el plano horizontal y giro de rectas notables de cota y alejamiento con cotas de desahogo.',
    block: 'Bloque 2 · Diédrico',
    blockCode: 'B2',
    difficulty: 'Avanzada',
    difficultyClass: 'bg-error-container text-on-error-container',
    sessions: 2,
    format: '3D Sim',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCifdyoVIK8yr7kjdYZc1GU4aYktLH6tk9ZBPfg7IOvOaBdaZZzIiMDEFluMvdiPocz6smcqdM82S7Brru6Bv-JMNJH6yNmc-LO0IV81JmmtLXlttNyl1RM39v6-8sAi4xGTX4SL5nWwSgfqcBL3CtwNCRfE0qors97Wc7zxMPriDcCq7mKU_456xIIT5Ga8DYMKJLdItYBSk-6vEqnM_cDA9zhD_O7zLBgZvFp6Bq4RZgxxa3ktvhP',
    criteria: ['CE 2.1 · Proyección', 'Crit. 2.1.1'],
    specs: {
      tool: 'Línea de Tierra + Abatimiento',
      scale: 'PAU / EBAU Ready'
    },
    category: 'b2',
    has3dSim: true
  },
  {
    id: 'act-3',
    title: 'Perspectiva Isométrica con corte al cuarto de pieza con taladros pasantes',
    description: 'Interpretación espacial tridimensional, rayado a 45º según norma UNE-EN ISO 128 y óvalos isométricos.',
    block: 'Bloques 2 y 3',
    blockCode: 'B2-3',
    difficulty: 'Dificultad Media',
    difficultyClass: 'bg-tertiary-fixed/40 text-on-tertiary-fixed-variant',
    sessions: 4,
    format: 'A3 DIN',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjNnz12VmunRx3V6ShKWNbF5AsqsG_QSGvOhQTR4X7zaQVBnpTNVDJJ5-SCqfYFyRUn88dm8YSzw-rFMR1tB49E5DrgQWZomyUu_RJQs_rFzjJAk9RXR2nu-yDMf8eQMk6ZZ2djRi489jBy1BVX9Z3Jxp0WUcvcGj4syxmfSE-jT4FpdlWbk7izDY1di85ptvELIiEySad5BMg0JGoQ0G8xyEy-uB-OYKvCO57_rADtWFoXQf2r7y3',
    criteria: ['CE 2.3 · Axonometría', 'CE 3.2 · Normalización'],
    specs: {
      tool: 'Coeficiente reducción: Ninguno (1:1)',
      scale: 'Lámina + Plantilla'
    },
    category: 'b2-ax',
    hasRubric: true
  },
  {
    id: 'act-4',
    title: 'Croquizado a mano alzada y acotación de una pieza de cerrajería tradicional de Zafra',
    description: 'Contexto patrimonial extremeño: proporción visual, líneas de cota, flechas normalizadas y tolerancias dimensionales.',
    block: 'Bloque 3 · Normalización',
    blockCode: 'B3',
    difficulty: 'Inicial / Nivel 1',
    difficultyClass: 'bg-surface-container-high text-on-surface-variant',
    sessions: 2,
    format: 'Croquis',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQs8SwPdxLH1bglaNpyPBcwIDBgqi9C9LPqTuNX9_QV7VXkfStjN7vAlP3wM4oXkyH-elFfmgOMqvxAWny_ft_2kGZqNHNPkWIm72s3MDTeLY1skM7EgsGCVSUgAAt_q33k_RauvBS7meXWunh8YpNGRfJ-3HsFKZmzpQhUgyPgtSzMMM5_lHd6pK_4JfQ0FMThpb771VfymgbaArwoJbc4kNZZ7Hkn-fTXbU-_kTlLubm8lJT2Qot',
    criteria: ['CE 3.1 · Acotación', 'Crit. 3.1.2'],
    specs: {
      tool: 'Lápiz HB + Calibrador pie de rey',
      scale: 'Mano Alzada'
    },
    category: 'b3'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 'alu-01', name: 'Álvarez Benítez, Lucía', group: '1.º Bachillerato A' },
  { id: 'alu-02', name: 'Bravo Cordero, Mario', group: '1.º Bachillerato A' },
  { id: 'alu-03', name: 'Cano Delgado, Valentina', group: '1.º Bachillerato A' },
  { id: 'alu-04', name: 'Gallego Domínguez, Carlos', group: '1.º Bachillerato A' },
  { id: 'alu-05', name: 'Herrera Morales, Irene', group: '1.º Bachillerato A' },
  { id: 'alu-06', name: 'Márquez Rivas, Elena', group: '1.º Bachillerato A' },
  { id: 'alu-07', name: 'Moreno Barrena, Mateo', group: '1.º Bachillerato A' },
  { id: 'alu-08', name: 'Parra Morales, Sara', group: '1.º Bachillerato A' },
  { id: 'alu-09', name: 'Romero Pacheco, Javier', group: '1.º Bachillerato A' },
  { id: 'alu-10', name: 'Sánchez Gil, Daniel', group: '1.º Bachillerato A' }
];

export const INITIAL_GRADE_RECORDS: StudentGradeRecord[] = [
  {
    studentId: 'alu-01',
    studentName: 'Álvarez Benítez, Lucía',
    scores: { 'cr11': 4, 'cr12': 4, 'cr21': 3, 'cr41': 4 },
    notes: 'Excelente precisión geométrica y rotulación normalizada.'
  },
  {
    studentId: 'alu-02',
    studentName: 'Bravo Cordero, Mario',
    scores: { 'cr11': 3, 'cr12': 2, 'cr21': 3, 'cr41': 3 },
    notes: 'Mejorar el trazado de arcos de enlace en tinta.'
  },
  {
    studentId: 'alu-03',
    studentName: 'Cano Delgado, Valentina',
    scores: { 'cr11': 4, 'cr12': 3, 'cr21': 4, 'cr41': 4 },
    notes: 'Gran comprensión espacial y pulcritud en el soporte.'
  },
  {
    studentId: 'alu-04',
    studentName: 'Gallego Domínguez, Carlos',
    scores: { 'cr11': 2, 'cr12': 2, 'cr21': 2, 'cr41': 3 },
    notes: 'Reforzar conceptos de tangencias básicas con regla y compás.'
  },
  {
    studentId: 'alu-05',
    studentName: 'Herrera Morales, Irene',
    scores: { 'cr11': 3, 'cr12': 4, 'cr21': 3, 'cr41': 3 },
    notes: 'Constante y muy metódica en la fase de croquizado.'
  },
  {
    studentId: 'alu-06',
    studentName: 'Márquez Rivas, Elena',
    scores: { 'cr11': 4, 'cr12': 4, 'cr21': 4, 'cr41': 4 },
    notes: 'Dominio sobresaliente de los fundamentos métricos.'
  },
  {
    studentId: 'alu-07',
    studentName: 'Moreno Barrena, Mateo',
    scores: { 'cr11': 3, 'cr12': 3, 'cr21': 2, 'cr41': 3 },
    notes: 'Atención a las normas de acotación funcional UNE.'
  },
  {
    studentId: 'alu-08',
    studentName: 'Parra Morales, Sara',
    scores: { 'cr11': 4, 'cr12': 3, 'cr21': 3, 'cr41': 4 },
    notes: 'Muy buena capacidad de resolución gráfica autónoma.'
  },
  {
    studentId: 'alu-09',
    studentName: 'Romero Pacheco, Javier',
    scores: { 'cr11': 2, 'cr12': 3, 'cr21': 2, 'cr41': 2 },
    notes: 'Requiere pautas de apoyo visual DUA en diédrico.'
  },
  {
    studentId: 'alu-10',
    studentName: 'Sánchez Gil, Daniel',
    scores: { 'cr11': 3, 'cr12': 4, 'cr21': 4, 'cr41': 3 },
    notes: 'Gran evolución en acotación y proporciones métricas.'
  }
];

export const SDA_TEMPLATES: SdaTemplate[] = [
  {
    id: 'tpl-geometria-plana',
    badge: 'Geometría Métrica',
    title: 'Geometría Métrica, Proporcionalidad y Polígonos en el Diseño Sostenible',
    description: 'Resolución de problemas de trazados fundamentales, proporcionalidad gráfica, semejanza y construcción de polígonos regulares e irregulares aplicados a estructuras modulares de energía fotovoltaica en Extremadura.',
    quarter: 1,
    totalSessions: 18,
    finalProduct: {
      format: 'Lámina DIN A3 + Memoria Gráfica',
      description: 'Plano técnico de replanteo geométrico de una estructura modular agrovoltaica.',
      context: 'Sector de energías renovables e infraestructuras en Extremadura'
    },
    prototype: {
      title: 'Trazados Fundamentales y Redes Modulares',
      type: 'Trazado Técnico & Compás',
      description: 'Construcción geométrica rigurosa con justificación analítica de enlaces y tangencias.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwPdsjlFqCK79szLrqjS6w9XzXuB1fp4H2xoV3tO_rWTv2bPonnAZKNrK3qhU1IOWCxvzeoLC6m8imz1z6wdgPkEoQwWbioBRkKejR7Nb5bYOpjaFSWWWfxMQPm1SrCC4uHqWVxPGFKJ7ZYPzrvJAOK-cY2DxcBCb6UPym3laDz_VHr4_AVUVRJCQtdcn_2f89GNKxejy-aoLbGsHRgm7xrH99qToSjmznPEdfU55LidYgbh9iaVwx'
    },
    ceCodes: ['CE.DT.1', 'CE.DT.4'],
    criterionCodes: ['1.1', '1.2', '4.1'],
    saberes: [
      'Trazados geométricos básicos: mediatriz, bisectriz, ángulos',
      'Lugares geométricos fundamentales y proporcionalidad',
      'Formatos de papel normalizados y cajetín UNE 1035'
    ],
    dua: {
      pauta1: {
        title: 'Pauta 1 · Múltiples formas de representación',
        description: 'Construcción paso a paso con código cromático (trazos auxiliares en 2H, solución en HB).',
        tags: ['Código cromático', 'Vídeos demostrativos']
      },
      pauta2: {
        title: 'Pauta 2 · Acción y Expresión',
        description: 'Plantillas semielaboradas para andamiaje de construcciones de alta complejidad.',
        tags: ['Andamiaje', 'Plantillas de trabajo']
      }
    }
  },
  {
    id: 'tpl-diedrico-directo',
    badge: 'Sistema Diédrico',
    title: 'El Sistema Diédrico Directo en la Definición de Elementos Estructurales',
    description: 'Estudio espacial del punto, la recta y el plano, pertenencias, paralelismo, perpendicularidad, distancias e intersecciones orientado al cálculo de piezas de soporte arquitectónico.',
    quarter: 2,
    totalSessions: 22,
    finalProduct: {
      format: 'Láminas A3 Normalizadas + Modelo 3D',
      description: 'Desarrollo en diédrico con determinación de verdaderas magnitudes mediante abatimientos y giros.',
      context: 'Ingeniería civil y arquitectura técnica regional'
    },
    prototype: {
      title: 'Proyección Ortogonal y Análisis Espacial',
      type: 'Diédrico & CAD 3D',
      description: 'Representación diédrica y verificación espacial tridimensional con simulación digital.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCifdyoVIK8yr7kjdYZc1GU4aYktLH6tk9ZBPfg7IOvOaBdaZZzIiMDEFluMvdiPocz6smcqdM82S7Brru6Bv-JMNJH6yNmc-LO0IV81JmmtLXlttNyl1RM39v6-8sAi4xGTX4SL5nWwSgfqcBL3CtwNCRfE0qors97Wc7zxMPriDcCq7mKU_456xIIT5Ga8DYMKJLdItYBSk-6vEqnM_cDA9zhD_O7zLBgZvFp6Bq4RZgxxa3ktvhP'
    },
    ceCodes: ['CE.DT.2', 'CE.DT.3', 'CE.DT.4'],
    criterionCodes: ['2.1', '2.2', '3.1', '4.1'],
    saberes: [
      'Proyección diédrica ortogonal: alfabeto del punto, recta y plano',
      'Posiciones relativas e intersecciones de elementos geométricos',
      'Métodos: abatimientos, giros y cambios de plano'
    ],
    dua: {
      pauta1: {
        title: 'Pauta 1 · Percepción espacial multisensorial',
        description: 'Modelos manipulativos de planos de proyección en metacrilato y simulador 3D interactivo.',
        tags: ['Simulación 3D', 'Manipulativos']
      },
      pauta2: {
        title: 'Pauta 2 · Implicación y Autonomía',
        description: 'Rúbricas de coevaluación entre pares con listas de cotejo de pasos diédricos.',
        tags: ['Listas de cotejo', 'Coevaluación']
      }
    }
  },
  {
    id: 'tpl-normalizacion-industrial',
    badge: 'Normalización UNE-ISO',
    title: 'Normalización Industrial: Vistas, Cortes, Secciones y Acotación Funcional',
    description: 'Croquizado a mano alzada y delineación a escala de componentes mecánicos industriales, aplicando normas UNE-EN ISO de representación de vistas, selección de cortes idóneos y acotación funcional.',
    quarter: 3,
    totalSessions: 18,
    finalProduct: {
      format: 'Plano de Fabricación Industrial DIN A3',
      description: 'Plano completo de conjunto y despiece con tolerancias dimensionales según norma UNE.',
      context: 'Sector agroindustrial y metalmecánico de Extremadura'
    },
    prototype: {
      title: 'Plano de Conjunto y Despiece Mecánico',
      type: 'Croquis Normalizado & Delineación',
      description: 'Corte al cuarto y medio corte con acotación funcional según UNE-EN ISO 128.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjNnz12VmunRx3V6ShKWNbF5AsqsG_QSGvOhQTR4X7zaQVBnpTNVDJJ5-SCqfYFyRUn88dm8YSzw-rFMR1tB49E5DrgQWZomyUu_RJQs_rFzjJAk9RXR2nu-yDMf8eQMk6ZZ2djRi489jBy1BVX9Z3Jxp0WUcvcGj4syxmfSE-jT4FpdlWbk7izDY1di85ptvELIiEySad5BMg0JGoQ0G8xyEy-uB-OYKvCO57_rADtWFoXQf2r7y3'
    },
    ceCodes: ['CE.DT.3', 'CE.DT.4'],
    criterionCodes: ['3.1', '3.2', '4.1', '4.2'],
    saberes: [
      'Sistemas de acotación funcional y de fabricación',
      'Cortes, secciones y roturas según normas UNE-EN ISO',
      'Croquizado a mano alzada y proporcionalidad visual'
    ],
    dua: {
      pauta1: {
        title: 'Pauta 1 · Opciones de comprensión y lenguaje técnico',
        description: 'Glosario visual con terminología normalizada y ejemplos de acotación correcta vs errónea.',
        tags: ['Glosario visual', 'Ejemplos resueltos']
      },
      pauta2: {
        title: 'Pauta 2 · Ejecución gradual',
        description: 'Proceso escalonado: croquis previo a mano alzada antes de pasar a la delineación técnica final.',
        tags: ['Faseado', 'Bocetado previo']
      }
    }
  },
  {
    id: 'tpl-axonometria-cad',
    badge: 'Axonometría & CAD',
    title: 'Sistemas Axonométricos e Infografía Técnica: De la Isometría al Modelado 3D',
    description: 'Perspectiva isométrica, dimétrica y caballera de piezas con superficies curvas y taladros pasantes, complementada con introducción al diseño asistido por ordenador (CAD 2D/3D).',
    quarter: 2,
    totalSessions: 16,
    finalProduct: {
      format: 'Lámina de Perspectiva + Render CAD Digital',
      description: 'Representación en perspectiva isométrica con coeficientes de reducción normalizados.',
      context: 'Diseño técnico y prototipado rápido en centros de FP y Universidad'
    },
    prototype: {
      title: 'Perspectiva Isométrica con Óvalos y Curvas',
      type: 'Isometría & CAD',
      description: 'Construcción de curvas técnicas e isocírculos de cuatro centros en ejes axonométricos.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQs8SwPdxLH1bglaNpyPBcwIDBgqi9C9LPqTuNX9_QV7VXkfStjN7vAlP3wM4oXkyH-elFfmgOMqvxAWny_ft_2kGZqNHNPkWIm72s3MDTeLY1skM7EgsGCVSUgAAt_q33k_RauvBS7meXWunh8YpNGRfJ-3HsFKZmzpQhUgyPgtSzMMM5_lHd6pK_4JfQ0FMThpb771VfymgbaArwoJbc4kNZZ7Hkn-fTXbU-_kTlLubm8lJT2Qot'
    },
    ceCodes: ['CE.DT.2', 'CE.DT.3', 'CE.DT.4'],
    criterionCodes: ['2.2', '2.3', '3.2', '4.1'],
    saberes: [
      'Perspectivas axonométricas: isométrica, dimétrica y trimétrica',
      'Representación de curvas y círculos en axonometría (óvalos de 4 centros)',
      'Herramientas CAD de modelado geométrico paramétrico'
    ],
    dua: {
      pauta1: {
        title: 'Pauta 1 · Interactividad tridimensional',
        description: 'Vistas rotatorias en tiempo real del objeto 3D para facilitar la inferencia ortogonal.',
        tags: ['Rotación 3D', 'Soporte visual']
      },
      pauta2: {
        title: 'Pauta 2 · Opciones de entrega flexible',
        description: 'Posibilidad de entrega en formato analógico a tinta o mediante exportación digital CAD.',
        tags: ['Flexibilidad de formato', 'TICs']
      }
    }
  }
];

