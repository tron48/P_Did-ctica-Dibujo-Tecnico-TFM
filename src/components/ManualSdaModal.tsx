import React, { useState } from 'react';

interface ManualSdaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: 'dashboard' | 'situaciones-aprendizaje' | 'calendario-temporizacion' | 'evaluacion-rubricas' | 'banco-actividades' | 'mapa-curricular') => void;
  onOpenNewSda?: () => void;
}

export const ManualSdaModal: React.FC<ManualSdaModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenNewSda
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  const steps = [
    {
      num: 1,
      title: 'Paso 1: Planteamiento del Reto y Contexto Real',
      badge: 'Motivación & ODS',
      icon: 'flag',
      summary: 'Partir de un problema real o profesional de ingeniería, arquitectura o diseño sostenible.',
      content: `
Toda Situación de Aprendizaje (SdA) bajo la normativa LOMLOE debe surgir de un **centro de interés significativo** para el alumnado.
- **Definición del Reto:** Plantea una pregunta impulsora o desafío del mundo real (ejemplo: *"¿Cómo diseñar el plano técnico y la pieza normalizada para una pasarela peatonal sostenible en Mérida?"*).
- **Justificación y Vinculación ODS:** Conecta la tarea con los Objetivos de Desarrollo Sostenible (ODS 9: Industria e Innovación, ODS 11: Ciudades Sostenibles).
- **Nivel y Curso:** Establece el nivel educativo (1.º o 2.º de Bachillerato) y el trimestre lectivo (1T, 2T o 3T).
      `,
      tips: 'En la app: Puedes pulsar en "+ Diseñar Nueva SdA" y elegir una plantilla de partida o partir desde cero con el Diseñador Curricular.'
    },
    {
      num: 2,
      title: 'Paso 2: Concreción Curricular LOMLOE en Cascada',
      badge: 'Competencias & Saberes',
      icon: 'account_tree',
      summary: 'Seleccionar Competencias Específicas, Criterios de Evaluación y Saberes Básicos.',
      content: `
La SdA no es una simple suma de ejercicios, sino la articulación del currículo oficial:
1. **Competencias Específicas (CE):** Selecciona las que se movilizan (ej. CE.DT.1 Geometría Métrica, CE.DT.2 Sistemas Espaciales, CE.DT.3 Normalización UNE, CE.DT.4 Proyectos Técnicos).
2. **Criterios de Evaluación vinculados:** Marca los criterios observables (ej. *Criterio 2.1: Representar formas tridimensionales mediante vistas diédricas normalizadas*).
3. **Saberes Básicos (Bloques A, B, C):** Selecciona los contenidos técnicos que el alumno necesita dominar para resolver el reto (trazados geométricos, abatimientos, secciones o acotación).
4. **Competencias Clave del Perfil de Salida:** Verifica la conexión con CCL, STEM, CD, CPSAA, CC, CE y CCEC.
      `,
      tips: 'En la app: En la pestaña "Situaciones de Aprendizaje", utiliza los desplegables interactivos en cascada para asociar automáticamente saberes y criterios.'
    },
    {
      num: 3,
      title: 'Paso 3: Temporización y Encadenamiento Lectivo',
      badge: 'Calendario Escolar',
      icon: 'calendar_clock',
      summary: 'Asignar número de sesiones y vincularlas automáticamente al calendario escolar oficial.',
      content: `
Una SdA debe ser viable en el tiempo escolar disponible:
- **Cálculo de Sesiones:** Asigna la carga lectiva (habitualmente entre 12 y 20 sesiones lectivas según la envergadura del proyecto).
- **Encadenamiento Automático:** Activa la vinculación continua para que la fecha de inicio de esta SdA empiece exactamente el día escolar siguiente a la finalización de la anterior.
- **Respeto al Calendario:** El algoritmo descuenta automáticamente festivos, puentes, vacaciones de Navidad y Semana Santa.
      `,
      tips: 'En la app: Ajusta las sesiones con los botones +/- o en la pestaña "Calendario y Temporización" para ver la distribución temporal exacta.'
    },
    {
      num: 4,
      title: 'Paso 4: Secuenciación Didáctica en 4 Fases',
      badge: 'Fases Metodológicas',
      icon: 'view_timeline',
      summary: 'Estructurar el desarrollo del aprendizaje en momentos pedagógicos claros.',
      content: `
Organiza el trabajo del aula en 4 fases metodológicas:
- **Fase 1 · Motivación e Ideas Previas (Sesiones 1-2):** Presentación del reto, debate inicial, bocetado libre y activación de conocimientos previos.
- **Fase 2 · Desarrollo e Investigación Técnica (Sesiones 3-10):** Explicación teórica, resolución de láminas prácticas, uso de instrumental técnico (escuadra, cartabón, compás) y herramientas CAD.
- **Fase 3 · Síntesis y Elaboración del Producto (Sesiones 11-14):** Trazado definitivo del plano normalizado UNE o elaboración del prototipo/maqueta 3D.
- **Fase 4 · Comunicación y Evaluación (Sesiones 15-16):** Exposición oral del proyecto, coevaluación entre pares y autoevaluación formativa.
      `,
      tips: 'En la app: Puedes redactar o ajustar las tareas de cada sesión en la sección "Secuenciación Didáctica" de la ficha técnica.'
    },
    {
      num: 5,
      title: 'Paso 5: Producto Final y Medidas DUA (Accesibilidad)',
      badge: 'DUA & Inclusión',
      icon: 'architecture',
      summary: 'Definir el entregable tangible y garantizar la accesibilidad para todo el alumnado.',
      content: `
El aprendizaje se consolida mediante un producto visible y evaluable:
- **Producto Final Tangible:** Lámina técnica acotada en formato A4/A3 según normas UNE, archivo 3D parametrizado, o prototipo físico.
- **Principios DUA (Diseño Universal para el Aprendizaje):**
  1. *Múltiples formas de representación:* Uso de modelos 3D interactivos, vídeos explicativos y guías visuales paso a paso además del libro de texto.
  2. *Múltiples formas de acción y expresión:* Permitir tanto el trazado tradicional sobre papel como la vectorización digital o maquetación física.
  3. *Múltiples formas de implicación:* Trabajo cooperativo con roles asignados, desafíos graduados por niveles de dificultad y andamiaje técnico.
      `,
      tips: 'En la app: Consulta el botón "Auditar DUA" en el Dashboard o en la ficha para verificar que se cumplen los 3 principios de accesibilidad.'
    },
    {
      num: 6,
      title: 'Paso 6: Evaluación Formativa y Rúbricas Graduadas',
      badge: 'Criterios & Notas',
      icon: 'fact_check',
      summary: 'Crear instrumentos de evaluación formativa y vincularlos al cuaderno del docente.',
      content: `
La evaluación LOMLOE es competencial, continua y formativa:
- **Instrumentos de Evaluación:** Rúbrica analítica del producto final, listas de cotejo de láminas diarias, diana de autoevaluación y prueba de ejecución técnica.
- **Rúbricas Graduadas (Niveles 1 a 4):**
  - *Nivel 1 (Insuficiente):* Presenta imprecisiones graves en el trazado o incumplimiento de normas UNE.
  - *Nivel 2 (Suficiente / Bien):* Aplica los fundamentos básicos con pequeñas desviaciones métricas.
  - *Nivel 3 (Notable):* Ejecuta el trazado con rigor, precisión geométrica y acotación correcta.
  - *Nivel 4 (Excelente):* Máxima pulcritud, dominio absoluto de la geometría espacial y creatividad en la solución técnica.
      `,
      tips: 'En la app: Visita "Evaluación y Rúbricas" para calificar al alumnado en tiempo real con ponderación oficial por competencias.'
    },
    {
      num: 7,
      title: 'Paso 7: Integración en el Mapa Curricular Anual',
      badge: 'Trazabilidad 100%',
      icon: 'hub',
      summary: 'Asegurar que todas las SdAs cubren el currículo completo sin vacíos.',
      content: `
Una SdA no funciona aislada; forma parte del engranaje anual de la materia:
- **Matriz de Cobertura Curricular:** Abre la pestaña **Mapa Curricular** para comprobar que todos los Criterios de Evaluación y Saberes Básicos del curso han sido trabajados al menos 1 o 2 veces.
- **Frecuencia de Evaluación:** Si detectas que algún criterio (por ejemplo, *CE.DT.4: Prototipado y proyectos*) tiene baja frecuencia, ajusta la SdA o programa una complementaria.
      `,
      tips: 'En la app: El Mapa Curricular te muestra en verde los criterios cubiertos y en ámbar los que requieren refuerzo.'
    },
    {
      num: 8,
      title: 'Paso 8: Consolidación y Exportación de la Programación (PDF)',
      badge: 'Documento Oficial',
      icon: 'picture_as_pdf',
      summary: 'Generar el documento completo de la Programación Didáctica para Inspección y Jefatura.',
      content: `
El paso final es la integración definitiva en el documento institucional:
- **Estructura Oficial Completa (8 Apartados):**
  1. Introducción y Justificación Legal (LOMLOE, Decreto 110/2022).
  2. Contextualización del Centro (IES Santa Eulalia, Mérida) y Alumnado.
  3. Competencias Clave y Competencias Específicas de la Materia (Ponderaciones %).
  4. Situaciones de Aprendizaje (Fichas detalladas con todas las fases y sesiones).
  5. Metodología Didáctica y Principios DUA.
  6. Evaluación de los Aprendizajes y Criterios de Calificación.
  7. Atención a la Diversidad y Medidas Inclusivas.
  8. Recursos Didácticos, Actividades Complementarias y Evaluación Docente.
- **Exportación Homologada:** Pulsa el botón "Generar Documento de Programación (PDF)" para obtener el PDF listo para imprimir o enviar a Jefatura de Estudios.
      `,
      tips: 'En la app: El botón "Generar Documento de Programación 2027–2028 (PDF)" recopila automáticamente todas tus SdAs, perfil del profesor y ponderaciones.'
    }
  ];

  const currentStepData = steps.find((s) => s.num === activeStep) || steps[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
              <span className="material-symbols-outlined text-[24px]">menu_book</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base md:text-lg text-white">
                  Manual de Creación de Situaciones de Aprendizaje (SdA)
                </h2>
                <span className="bg-sky-400/20 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-400/30">
                  LOMLOE · Paso a Paso
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Guía completa desde el diseño inicial hasta la integración total en la Programación Didáctica oficial.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition-colors"
            title="Cerrar Manual"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Step Navigation Pill Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {steps.map((st) => (
            <button
              key={st.num}
              type="button"
              onClick={() => setActiveStep(st.num)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                activeStep === st.num
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-200/30 flex items-center justify-center text-[10px] font-bold">
                {st.num}
              </span>
              <span className="truncate max-w-[110px] md:max-w-none">{st.title.split(':')[1] || st.title}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
          {/* Step Hero Card */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[26px]">{currentStepData.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-secondary bg-sky-100/80 px-2 py-0.5 rounded border border-sky-300">
                  {currentStepData.badge}
                </span>
                <span className="text-xs text-slate-500 font-medium">Paso {currentStepData.num} de 8</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{currentStepData.title}</h3>
              <p className="text-xs md:text-sm text-slate-600 mt-1">{currentStepData.summary}</p>
            </div>
          </div>

          {/* Detailed Content */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-slate-700 text-[18px]">description</span>
              Procedimiento Pedagógico y Técnico
            </h4>
            <div className="text-xs md:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line font-normal">
              {currentStepData.content.trim()}
            </div>
          </div>

          {/* Practical in-app tip */}
          <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600 text-[22px] shrink-0 mt-0.5">
              lightbulb
            </span>
            <div className="text-xs text-amber-900 leading-snug">
              <strong className="font-bold text-amber-950 block mb-0.5">Cómo aplicarlo en la aplicación:</strong>
              {currentStepData.tips}
            </div>
          </div>

          {/* Quick Workflow Map */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Flujo de Trabajo Completo en Norma & Trazo:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className={`p-2 rounded-lg border text-center ${activeStep === 1 ? 'bg-sky-100 border-sky-300 font-bold text-secondary' : 'bg-white border-slate-200 text-slate-600'}`}>
                1. Reto y ODS
              </div>
              <div className={`p-2 rounded-lg border text-center ${activeStep === 2 ? 'bg-sky-100 border-sky-300 font-bold text-secondary' : 'bg-white border-slate-200 text-slate-600'}`}>
                2. Currículo LOMLOE
              </div>
              <div className={`p-2 rounded-lg border text-center ${activeStep === 3 ? 'bg-sky-100 border-sky-300 font-bold text-secondary' : 'bg-white border-slate-200 text-slate-600'}`}>
                3. Calendario & Sesiones
              </div>
              <div className={`p-2 rounded-lg border text-center ${activeStep === 4 ? 'bg-sky-100 border-sky-300 font-bold text-secondary' : 'bg-white border-slate-200 text-slate-600'}`}>
                4. Secuencia (4 Fases)
              </div>
              <div className={`p-2 rounded-lg border text-center ${activeStep === 5 ? 'bg-sky-100 border-sky-300 font-bold text-secondary' : 'bg-white border-slate-200 text-slate-600'}`}>
                5. Producto & DUA
              </div>
              <div className={`p-2 rounded-lg border text-center ${activeStep === 6 ? 'bg-sky-100 border-sky-300 font-bold text-secondary' : 'bg-white border-slate-200 text-slate-600'}`}>
                6. Rúbricas & Cuaderno
              </div>
              <div className={`p-2 rounded-lg border text-center ${activeStep === 7 ? 'bg-sky-100 border-sky-300 font-bold text-secondary' : 'bg-white border-slate-200 text-slate-600'}`}>
                7. Mapa Curricular
              </div>
              <div className={`p-2 rounded-lg border text-center ${activeStep === 8 ? 'bg-sky-100 border-sky-300 font-bold text-secondary' : 'bg-white border-slate-200 text-slate-600'}`}>
                8. Exportar PDF Oficial
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <button
            type="button"
            disabled={activeStep <= 1}
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Paso Anterior
          </button>

          <div className="flex items-center gap-2">
            {onOpenNewSda && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewSda();
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px] text-sky-400">add_circle</span>
                Crear SdA Ahora
              </button>
            )}

            {activeStep < 8 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => Math.min(8, prev + 1))}
                className="px-4 py-2 text-xs font-bold text-white bg-secondary hover:bg-sky-700 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                Siguiente Paso ({activeStep + 1}/8)
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                ¡Entendido, volver al programa!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
