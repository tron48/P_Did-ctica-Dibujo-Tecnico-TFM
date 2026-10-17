import React, { useState } from 'react';
import { RUBRIC_LEVELS } from '../data/curriculumData';
import { RubricLevel, SdaData, Student, StudentGradeRecord } from '../types';
import { GradebookSection } from './GradebookSection';

interface RubricasViewProps {
  weights: { ce1: number; ce2: number; ce3: number; ce4: number };
  onOpenWeightEditor: () => void;
  onOpenPdf: () => void;
  onShowToast: (message: string) => void;
  sdas?: SdaData[];
  students?: Student[];
  gradeRecords?: StudentGradeRecord[];
  onUpdateGradeRecords?: (records: StudentGradeRecord[]) => void;
  onAddStudent?: (student: Student) => void;
  onRemoveStudent?: (studentId: string) => void;
}

export const RubricasView: React.FC<RubricasViewProps> = ({
  weights,
  onOpenWeightEditor,
  onOpenPdf,
  onShowToast,
  sdas = [],
  students = [],
  gradeRecords = [],
  onUpdateGradeRecords = () => {},
  onAddStudent = () => {},
  onRemoveStudent = () => {}
}) => {
  const [evalMode, setEvalMode] = useState<'rubricas' | 'cuaderno'>('rubricas');
  const [activeFilter, setActiveFilter] = useState<'all' | 'n4' | 'n3' | 'n2'>('all');
  const [selectedScore, setSelectedScore] = useState<number | null>(9.5);
  const [selectedLevel, setSelectedLevel] = useState<number>(4);

  const filteredLevels = RUBRIC_LEVELS.filter((level) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'n4') return level.level === 4;
    if (activeFilter === 'n3') return level.level === 3;
    if (activeFilter === 'n2') return level.level <= 2;
    return true;
  });

  const handleSelectLevel = (level: RubricLevel) => {
    setSelectedLevel(level.level);
    setSelectedScore(level.score);
    onShowToast(`Puntuación simulada: ${level.score} pts asignados a la lámina técnica (${level.name}).`);
  };

  const handleApplyToSda = () => {
    onShowToast('Rúbrica y ponderaciones vinculadas a SDA 2: Tangencias y Enlaces');
  };

  return (
    <div className="flex flex-col w-full px-4 md:px-6">
      {/* View Switcher Tabs: Rúbricas vs Cuaderno */}
      <div className="pt-4 pb-3 flex items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setEvalMode('rubricas')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              evalMode === 'rubricas'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">fact_check</span>
            <span>Matriz de Rúbricas &amp; Ponderación</span>
          </button>
          <button
            onClick={() => setEvalMode('cuaderno')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              evalMode === 'cuaderno'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">grade</span>
            <span>Cuaderno del Profesor (Calificaciones)</span>
            <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {students.length}
            </span>
          </button>
        </div>

        {evalMode === 'rubricas' ? (
          <button
            onClick={onOpenWeightEditor}
            className="text-xs text-primary font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Editar Ponderación</span>
          </button>
        ) : (
          <button
            onClick={onOpenPdf}
            className="text-xs text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-slate-50 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px] text-red-600">picture_as_pdf</span>
            <span>Dossier Oficial</span>
          </button>
        )}
      </div>

      {evalMode === 'cuaderno' ? (
        <div className="pt-4 pb-12">
          <GradebookSection
            sdas={sdas}
            students={students}
            gradeRecords={gradeRecords}
            onUpdateGradeRecords={onUpdateGradeRecords}
            onAddStudent={onAddStudent}
            onRemoveStudent={onRemoveStudent}
            weights={weights}
            onShowToast={onShowToast}
          />
        </div>
      ) : (
        <div className="flex flex-col w-full pt-4">
      {/* Interactive & Compass Banner Header */}
      <div className="px-margin-mobile pt-space-md pb-space-sm flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary text-[20px]">architecture</span>
            <span className="font-label-badge text-label-badge text-secondary font-semibold uppercase tracking-wider">
              Criterios &amp; Ponderación
            </span>
          </div>
          <span className="font-label-code text-label-code bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded font-mono font-semibold">
            D. 110/2022
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
            Evaluación &amp; Rúbricas
          </h2>
          <button
            onClick={onOpenWeightEditor}
            className="font-label-code text-label-code text-secondary flex items-center gap-1 hover:text-on-secondary-container transition-colors py-1 cursor-pointer font-bold"
            id="btn-edit-weights"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Editar Ponderación</span>
          </button>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Alineación competencial, ponderación por bloques y matrices de rúbricas analíticas para 1.º de Bachillerato.
        </p>
      </div>

      {/* Geometric Decorative Progress / Dial Card (Bento Style) */}
      <div className="px-margin-mobile mb-space-md">
        <div className="relative overflow-hidden bg-primary-container text-on-primary p-space-md rounded-xl shadow-md">
          {/* Blueprint Compass SVG overlay */}
          <svg className="absolute -right-6 -bottom-6 w-36 h-36 text-surface-tint/20 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" strokeDasharray="3 3" strokeWidth="1.5"></circle>
            <path d="M50 8 L50 92 M8 50 L92 50" strokeWidth="0.8"></path>
            <circle cx="50" cy="50" fill="currentColor" r="4"></circle>
            <path d="M50 20 L68 76 L32 76 Z" strokeLinejoin="round" strokeWidth="1.5"></path>
            <circle cx="50" cy="20" fill="#0f2942" r="5" strokeWidth="1.5"></circle>
          </svg>
          <div className="relative z-10 flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-badge text-label-badge text-secondary-fixed uppercase tracking-wider font-semibold">
                  Distribución Global
                </span>
                <span className="font-headline-sm text-headline-sm text-on-primary font-bold">
                  Marco LOMLOE Extremadura
                </span>
              </div>
              <span className="font-label-code text-label-code bg-surface-container-lowest/15 text-tertiary-fixed px-2 py-1 rounded font-bold">
                100% CERRADO
              </span>
            </div>

            {/* Visual Multi-segment Bar */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="h-2.5 w-full bg-surface-container-lowest/20 rounded-full flex overflow-hidden p-0.5 gap-0.5">
                <div className="h-full bg-secondary-container rounded-sm transition-all duration-300" style={{ width: `${weights.ce1}%` }} title={`C.E. 1 (${weights.ce1}%)`}></div>
                <div className="h-full bg-secondary-fixed rounded-sm transition-all duration-300" style={{ width: `${weights.ce2}%` }} title={`C.E. 2 (${weights.ce2}%)`}></div>
                <div className="h-full bg-tertiary-fixed rounded-sm transition-all duration-300" style={{ width: `${weights.ce3}%` }} title={`C.E. 3 (${weights.ce3}%)`}></div>
                <div className="h-full bg-tertiary-fixed-dim rounded-sm transition-all duration-300" style={{ width: `${weights.ce4}%` }} title={`C.E. 4 (${weights.ce4}%)`}></div>
              </div>
              <div className="grid grid-cols-2 gap-x-space-md gap-y-1 mt-1 font-body-sm text-body-sm">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary-container shrink-0"></span>
                  <span className="truncate text-surface-container-high">C.E. 1 Métrica ({weights.ce1}%)</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed shrink-0"></span>
                  <span className="truncate text-surface-container-high">C.E. 2 Diédrico/Axon ({weights.ce2}%)</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed shrink-0"></span>
                  <span className="truncate text-surface-container-high">C.E. 3 Normalización ({weights.ce3}%)</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim shrink-0"></span>
                  <span className="truncate text-surface-container-high">C.E. 4 CAD/Equipo ({weights.ce4}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Weight Distribution Accordion/Cards */}
      <div className="px-margin-mobile flex flex-col gap-space-xs mb-space-md">
        <div className="flex items-center justify-between mb-1">
          <span className="font-title-sm text-title-sm text-on-surface font-bold">
            Ponderación por Criterios y Competencias
          </span>
          <span className="font-label-code text-label-code text-on-surface-variant">4 Competencias</span>
        </div>

        {/* Competencia 1 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col gap-2 border border-surface-container/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs min-w-0">
              <span className="w-1.5 h-6 bg-secondary rounded-full shrink-0"></span>
              <div className="flex flex-col min-w-0">
                <span className="font-title-sm text-title-sm text-on-surface truncate font-semibold">
                  C.E. 1 · Geometría Métrica y Construcciones
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Resolución de tangencias, cónicas y trazados fundamentales
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 pl-2">
              <span className="font-title-md text-title-md text-secondary font-bold">{weights.ce1}%</span>
              <span className="font-label-badge text-label-badge text-on-surface-variant">Crit. 1.1 - 1.4</span>
            </div>
          </div>
        </div>

        {/* Competencia 2 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col gap-2 border border-surface-container/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs min-w-0">
              <span className="w-1.5 h-6 bg-secondary-container rounded-full shrink-0"></span>
              <div className="flex flex-col min-w-0">
                <span className="font-title-sm text-title-sm text-on-surface truncate font-semibold">
                  C.E. 2 · Sistemas de Representación
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Sistema Diédrico (punto, recta, plano) e Isometría/Caballera
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 pl-2">
              <span className="font-title-md text-title-md text-secondary font-bold">{weights.ce2}%</span>
              <span className="font-label-badge text-label-badge text-on-surface-variant">Crit. 2.1 - 2.5</span>
            </div>
          </div>
        </div>

        {/* Competencia 3 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col gap-2 border border-surface-container/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs min-w-0">
              <span className="w-1.5 h-6 bg-tertiary-container rounded-full shrink-0"></span>
              <div className="flex flex-col min-w-0">
                <span className="font-title-sm text-title-sm text-on-surface truncate font-semibold">
                  C.E. 3 · Normalización &amp; Croquización
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Normas UNE-EN ISO, vistas, acotación funcional y cortes
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 pl-2">
              <span className="font-title-md text-title-md text-tertiary-container font-bold">{weights.ce3}%</span>
              <span className="font-label-badge text-label-badge text-on-surface-variant">Crit. 3.1 - 3.3</span>
            </div>
          </div>
        </div>

        {/* Competencia 4 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col gap-2 border border-surface-container/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs min-w-0">
              <span className="w-1.5 h-6 bg-surface-tint rounded-full shrink-0"></span>
              <div className="flex flex-col min-w-0">
                <span className="font-title-sm text-title-sm text-on-surface truncate font-semibold">
                  C.E. 4 · Diseño Asistido (CAD) &amp; Colectivo
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Modelado vectorial, trabajo cooperativo y rigor digital
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 pl-2">
              <span className="font-title-md text-title-md text-on-surface-variant font-bold">{weights.ce4}%</span>
              <span className="font-label-badge text-label-badge text-on-surface-variant">Crit. 4.1 - 4.2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Rubric Section */}
      <div className="px-margin-mobile flex flex-col gap-space-sm mb-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-label-badge text-label-badge text-secondary font-semibold uppercase tracking-wider">
              Matriz de Evaluación Analítica
            </span>
            <span className="font-label-code text-label-code bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded font-bold">
              RÚBRICA A3
            </span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            Calificación de Lámina Técnica Normalizada (A3)
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Selecciona el descriptor observado para simular la calificación de la pieza gráfica del estudiante.
          </p>
        </div>

        {/* Interactive Level Filter / Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container rounded-xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`rubric-tab py-1.5 px-1 rounded-lg text-center font-label-code text-label-code transition-all ${
              activeFilter === 'all'
                ? 'bg-primary-container text-on-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveFilter('n4')}
            className={`rubric-tab py-1.5 px-1 rounded-lg text-center font-label-code text-label-code transition-all ${
              activeFilter === 'n4'
                ? 'bg-primary-container text-on-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            N4 (10-9)
          </button>
          <button
            onClick={() => setActiveFilter('n3')}
            className={`rubric-tab py-1.5 px-1 rounded-lg text-center font-label-code text-label-code transition-all ${
              activeFilter === 'n3'
                ? 'bg-primary-container text-on-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            N3 (8-7)
          </button>
          <button
            onClick={() => setActiveFilter('n2')}
            className={`rubric-tab py-1.5 px-1 rounded-lg text-center font-label-code text-label-code transition-all ${
              activeFilter === 'n2'
                ? 'bg-primary-container text-on-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            N2-1 (≤6)
          </button>
        </div>

        {/* Active Rubric Cards List */}
        <div className="flex flex-col gap-space-xs" id="rubric-cards-container">
          {filteredLevels.map((lvl) => {
            const isSelected = selectedLevel === lvl.level;
            return (
              <div
                key={lvl.level}
                className={`rubric-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all border-l-4 ${lvl.borderColorClass} ${
                  isSelected ? 'ring-2 ring-secondary' : 'border border-surface-container/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-label-badge text-label-badge font-bold ${lvl.badgeBgClass}`}>
                      {lvl.level}
                    </span>
                    <span className="font-title-sm text-title-sm text-on-surface font-bold">
                      {lvl.name}
                    </span>
                  </div>
                  <span className={`font-label-code text-label-code px-2 py-0.5 rounded font-bold ${lvl.badgeBgClass}`}>
                    {lvl.pointsRange}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface mb-2">
                  {lvl.description}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-surface-container-low">
                  <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">{lvl.tagIcon}</span>
                    {lvl.tag}
                  </span>
                  <button
                    onClick={() => handleSelectLevel(lvl)}
                    className={`font-label-code text-label-code px-3 py-1 rounded transition-colors ${
                      isSelected
                        ? 'bg-secondary text-on-secondary font-bold'
                        : 'bg-surface-container text-on-surface hover:bg-secondary hover:text-on-secondary'
                    }`}
                  >
                    {isSelected ? `Seleccionado (${lvl.score})` : `Seleccionar (${lvl.score})`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Drawing Workshop Artifacts / Instruments of Evaluation */}
      <div className="px-margin-mobile flex flex-col gap-space-sm mb-space-md">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-badge text-label-badge text-secondary font-semibold uppercase tracking-wider">
              Instrumentos de Evaluación
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Herramientas &amp; Evidencias Ponderadas
            </h3>
          </div>
          <span className="font-label-code text-label-code text-on-surface-variant">Trimestre 1</span>
        </div>

        <div className="grid grid-cols-2 gap-space-xs">
          {/* Instrument 1: Lamina Tecnica */}
          <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col justify-between gap-space-xs border border-surface-container/60">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="p-1.5 bg-surface-container rounded-lg text-secondary">
                  <span className="material-symbols-outlined text-[20px]">draw</span>
                </span>
                <span className="font-headline-sm text-headline-sm text-secondary font-bold">40%</span>
              </div>
              <span className="font-title-sm text-title-sm text-on-surface mt-1 font-bold">
                Láminas de Taller
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Láminas formato A3 en papel de 130g, trazado a lápiz 2H/HB y tinta.
              </span>
            </div>
            <div className="flex items-center gap-1 pt-1 font-label-code text-label-code text-on-tertiary-container font-semibold">
              <span className="material-symbols-outlined text-[14px]">checklist</span> 6 entregas previstas
            </div>
          </div>

          {/* Instrument 2: Prueba Práctica */}
          <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col justify-between gap-space-xs border border-surface-container/60">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="p-1.5 bg-surface-container rounded-lg text-secondary">
                  <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                </span>
                <span className="font-headline-sm text-headline-sm text-secondary font-bold">35%</span>
              </div>
              <span className="font-title-sm text-title-sm text-on-surface mt-1 font-bold">
                Pruebas Gráficas
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Examen práctico de resolución geométrica y diédrico individual sin apuntes.
              </span>
            </div>
            <div className="flex items-center gap-1 pt-1 font-label-code text-label-code text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">timer</span> 2 sesiones / eval.
            </div>
          </div>

          {/* Instrument 3: Diario de Bocetos */}
          <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col justify-between gap-space-xs border border-surface-container/60">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="p-1.5 bg-surface-container rounded-lg text-secondary">
                  <span className="material-symbols-outlined text-[20px]">menu_book</span>
                </span>
                <span className="font-headline-sm text-headline-sm text-secondary font-bold">15%</span>
              </div>
              <span className="font-title-sm text-title-sm text-on-surface mt-1 font-bold">
                Cuaderno de Croquis
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Bocetado a mano alzada, croquización rápida y apuntes de aula.
              </span>
            </div>
            <div className="flex items-center gap-1 pt-1 font-label-code text-label-code text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">auto_stories</span> Revisión quincenal
            </div>
          </div>

          {/* Instrument 4: Auto/Coevaluación */}
          <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col justify-between gap-space-xs border border-surface-container/60">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="p-1.5 bg-surface-container rounded-lg text-secondary">
                  <span className="material-symbols-outlined text-[20px]">groups</span>
                </span>
                <span className="font-headline-sm text-headline-sm text-secondary font-bold">10%</span>
              </div>
              <span className="font-title-sm text-title-sm text-on-surface mt-1 font-bold">
                Coevaluación Diádica
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Revisión entre pares con escala de cotejo y reflexión metacognitiva.
              </span>
            </div>
            <div className="flex items-center gap-1 pt-1 font-label-code text-label-code text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">published_with_changes</span> Formulario digital
            </div>
          </div>
        </div>
      </div>

      {/* Real Workshop Photographic Context */}
      <div className="px-margin-mobile mb-space-md">
        <div className="relative rounded-xl overflow-hidden shadow-sm bg-surface-container-low">
          <img
            className="w-full h-36 object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbKrznWoZ0JSOQEz-1stgqpa8ccJQjdelkHuKtVmwJ_tLWEsiIbw9tYSChv_bo8qNYBxLnopbQyJbv1VtZPxRjsDIr7ek_5bM96oOgebICapAB-Wia5sXrnXRGqPExfRL9kqzMqM8cJAgjrkQoP1TYN7Ps3-8MA70H1SX8CH8MsJbryfetskn5a6fdDSDIMMYvb9PavyBCAU7QmmQ9s1J-ULCx37toZxB6k5bf1z2Xet1cGGJLoDEI"
            alt="Taller Técnico"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent flex flex-col justify-end p-space-sm">
            <span className="font-label-badge text-label-badge text-secondary-fixed uppercase tracking-wider font-semibold">
              Taller Técnico · Aula 104
            </span>
            <span className="font-title-sm text-title-sm text-on-primary font-bold">
              Estándares UNE 1034 &amp; Directrices de Calidad Gráfica
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Footer Toolbar */}
      <div className="px-margin-mobile flex flex-col gap-space-xs pb-space-lg">
        <button
          onClick={handleApplyToSda}
          className="w-full py-3 px-space-md bg-primary-container text-on-primary rounded-xl font-title-sm text-title-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-secondary transition-all active:scale-[0.99]"
          id="btn-apply-sda"
        >
          <span className="material-symbols-outlined text-[20px]">assignment_add</span>
          <span>Aplicar a Situación de Aprendizaje 2 (SDA 2)</span>
        </button>
        <button
          onClick={onOpenPdf}
          className="w-full py-2.5 px-space-md bg-surface-container-lowest text-on-surface rounded-xl font-title-sm text-title-sm font-medium flex items-center justify-center gap-2 shadow-sm hover:bg-surface-container transition-all active:scale-[0.99] border border-surface-container/60"
          id="btn-export-pdf"
        >
          <span className="material-symbols-outlined text-[20px] text-secondary">picture_as_pdf</span>
          <span>Descargar Rúbrica en PDF Oficial</span>
        </button>
      </div>
        </div>
      )}
    </div>
  );
};

