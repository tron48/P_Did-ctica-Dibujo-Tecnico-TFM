import { CurriculumCEOption, CurriculumBlockOption } from '../types';

export const CURRICULUM_CE_OPTIONS: CurriculumCEOption[] = [
  {
    id: 'ce-1',
    code: 'CE.DT1.1',
    label: '1. Representar e interpretar elementos o conjuntos aplicando fundamentos métricos',
    criteria: [
      {
        id: 'crit-1-1',
        code: '1.1',
        label: '1.1. Resolver problemas de tangencias y enlaces geométricos aplicando centros de curvatura',
        perfilSalida: 'STEM1, STEM2, CD2, CPSAA1.1'
      },
      {
        id: 'crit-1-2',
        code: '1.2',
        label: '1.2. Trazar curvas técnicas y cónicas aplicadas al diseño de componentes y estructuras',
        perfilSalida: 'STEM1, STEM2, CCEC3.1'
      },
      {
        id: 'crit-1-3',
        code: '1.3',
        label: '1.3. Realizar transformaciones geométricas planas (traslación, giro, simetría y homotecia)',
        perfilSalida: 'STEM1, STEM2, CPSAA1.1'
      },
      {
        id: 'crit-1-4',
        code: '1.4',
        label: '1.4. Diseñar soluciones técnicas y composiciones gráficas complejas con rigor métrico',
        perfilSalida: 'STEM2, CD2, CPSAA1.1'
      }
    ]
  },
  {
    id: 'ce-2',
    code: 'CE.DT1.2',
    label: '2. Desarrollar la visión espacial y proyectiva mediante el Sistema Diédrico ortogonal',
    criteria: [
      {
        id: 'crit-2-1',
        code: '2.1',
        label: '2.1. Determinar la posición relativa y distancias entre elementos en el sistema diédrico',
        perfilSalida: 'STEM2, STEM4, CPSAA1.1'
      },
      {
        id: 'crit-2-2',
        code: '2.2',
        label: '2.2. Obtener la verdadera magnitud de formas y distancias mediante giros y abatimientos',
        perfilSalida: 'STEM1, STEM2, CPSAA1.1'
      },
      {
        id: 'crit-2-3',
        code: '2.3',
        label: '2.3. Representar poliedros regulares y figuras prismáticas con sus secciones planas',
        perfilSalida: 'STEM2, CCEC3.1'
      }
    ]
  },
  {
    id: 'ce-3',
    code: 'CE.DT1.3',
    label: '3. Aplicar sistemas axonométricos (isométrica, caballera) para comunicar ideas volumétricas',
    criteria: [
      {
        id: 'crit-3-1',
        code: '3.1',
        label: '3.1. Construir perspectivas isométricas normalizadas con/sin coeficiente de reducción',
        perfilSalida: 'STEM1, STEM2, CCEC3.1'
      },
      {
        id: 'crit-3-2',
        code: '3.2',
        label: '3.2. Representar piezas técnicas mecánicas con cortes y secciones al cuarto en perspectiva',
        perfilSalida: 'STEM2, CD2, CPSAA1.1'
      },
      {
        id: 'crit-3-3',
        code: '3.3',
        label: '3.3. Interpretar croquis axonométricos y realizar la correspondencia con vistas diédricas',
        perfilSalida: 'STEM2, CD1, CPSAA1.1'
      }
    ]
  },
  {
    id: 'ce-4',
    code: 'CE.DT1.4',
    label: '4. Aplicar normas UNE e ISO en la elaboración de planos y croquizado técnico',
    criteria: [
      {
        id: 'crit-4-1',
        code: '4.1',
        label: '4.1. Acotar figuras y planos según normas UNE e ISO garantizando la legibilidad técnica',
        perfilSalida: 'STEM2, CD2, CPSAA1.1, CC3'
      },
      {
        id: 'crit-4-2',
        code: '4.2',
        label: '4.2. Representar vistas normalizadas (alzado, planta, perfil) con jerarquía de líneas y cortes',
        perfilSalida: 'STEM1, STEM2, CD2'
      },
      {
        id: 'crit-4-3',
        code: '4.3',
        label: '4.3. Elaborar croquis acotados a mano alzada con proporciones dimensionales correctas',
        perfilSalida: 'STEM2, CPSAA1.1, CCEC3.1'
      }
    ]
  },
  {
    id: 'ce-5',
    code: 'CE.DT1.5',
    label: '5. Utilizar aplicaciones CAD 2D/3D y herramientas digitales para documentar proyectos',
    criteria: [
      {
        id: 'crit-5-1',
        code: '5.1',
        label: '5.1. Modelar geométricamente piezas y conjuntos mediante herramientas de diseño vectorial',
        perfilSalida: 'CD1, CD2, CD3, STEM2'
      },
      {
        id: 'crit-5-2',
        code: '5.2',
        label: '5.2. Gestionar capas, estilos de cota, bloques normalizados y cajetines oficiales en CAD',
        perfilSalida: 'CD2, CD5, CPSAA1.1'
      }
    ]
  }
];

export const CURRICULUM_BLOCK_OPTIONS: CurriculumBlockOption[] = [
  {
    id: 'block-a',
    code: 'Bloque A',
    label: 'Bloque A. Fundamentos geométricos y geometría métrica.',
    saberes: [
      {
        id: 'saber-a1',
        label: 'Trazados fundamentales en el plano y polígonos',
        subbloques: [
          'Paralelismo, perpendicularidad, mediatrices y bisectrices',
          'Construcción de polígonos regulares inscritos y con lado dado',
          'Lugares geométricos fundamentales (arco capaz y homotecia)'
        ]
      },
      {
        id: 'saber-a2',
        label: 'Tangencias, enlaces y curvas técnicas',
        subbloques: [
          'Propiedades de tangencias recta-circunferencia y circunferencia-circunferencia',
          'Enlaces de arcos en perfiles mecánicos y logotipos industriales',
          'Curvas técnicas: óvalos, ovoides de 4 centros y espirales'
        ]
      },
      {
        id: 'saber-a3',
        label: 'Curvas cónicas (elipse, parábola, hipérbola)',
        subbloques: [
          'Definición como lugares geométricos y trazado por puntos',
          'Trazado de tangentes y secantes desde puntos dados',
          'Aplicaciones técnicas en ingeniería y arquitectura'
        ]
      }
    ]
  },
  {
    id: 'block-b',
    code: 'Bloque B',
    label: 'Bloque B. Sistemas de representación (Diédrico y Axonometría).',
    saberes: [
      {
        id: 'saber-b1',
        label: 'Sistema Diédrico ortogonal (punto, recta y plano)',
        subbloques: [
          'Representación de punto, recta y plano: posiciones notables y trazas',
          'Pertenencia, paralelismo, perpendicularidad e intersecciones',
          'Métodos auxiliares: abatimientos sobre plano horizontal y vertical',
          'Cambios de plano y giros para obtención de verdadera magnitud'
        ]
      },
      {
        id: 'saber-b2',
        label: 'Perspectiva Axonométrica (Isométrica y Caballera)',
        subbloques: [
          'Ejes axonométricos, escalas y coeficiente de reducción (0.816)',
          'Trazado de óvalos isométricos y circunferencias en perspectiva',
          'Perspectiva caballera con coeficientes de reducción 1/2 y 2/3'
        ]
      }
    ]
  },
  {
    id: 'block-c',
    code: 'Bloque C',
    label: 'Bloque C. Normalización y documentación técnica gráfica.',
    saberes: [
      {
        id: 'saber-c1',
        label: 'Formatos, líneas normalizadas y escalas UNE-EN ISO',
        subbloques: [
          'Formatos de papel normalizados Serie A (A3, A4) y cajetín oficial UNE 1035',
          'Tipos de líneas normalizadas y jerarquía de trazo (0.8, 0.4, 0.2 mm)',
          'Escalas normalizadas de ampliación, natural y reducción (UNE-EN ISO 5455)'
        ]
      },
      {
        id: 'saber-c2',
        label: 'Vistas normalizadas, acotación funcional y cortes',
        subbloques: [
          'Vistas diédricas normalizadas según método del primer diedro (Europeo)',
          'Sistemas de acotación funcional, de fabricación y tolerancias',
          'Cortes totales, semicortes al cuarto, secciones abatidas y roturas'
        ]
      }
    ]
  },
  {
    id: 'block-d',
    code: 'Bloque D',
    label: 'Bloque D. Sistemas CAD.',
    saberes: [
      {
        id: 'saber-d1',
        label: 'Diseño asistido por ordenador 2D (LibreCAD / QCAD)',
        subbloques: [
          'Gestión de capas normalizadas, tipos de línea y colores UNE',
          'Entidades vectoriales, referencias a objetos (Osnap) y cotas dinámicas',
          'Exportación en formato DXF/SVG y preparación de láminas para ploteo'
        ]
      },
      {
        id: 'saber-d2',
        label: 'Modelado paramétrico tridimensional 3D (FreeCAD / GeoGebra 3D)',
        subbloques: [
          'Croquis 2D con restricciones geométricas y operaciones de extrusión/revolución',
          'Vaciados, taladros pasantes, nervios y verificación espacial de tolerancias',
          'Generación automatizada de vistas ortogonales 2D a partir del modelo 3D'
        ]
      }
    ]
  }
];
