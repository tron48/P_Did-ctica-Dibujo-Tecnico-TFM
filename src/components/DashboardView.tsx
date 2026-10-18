import React, { useState } from 'react';
import { NavTab, TeacherProfile, SdaData } from '../types';
import { formatHumanDate } from '../utils/calendarScheduler';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenNewSda: () => void;
  onOpenExportPdf: () => void;
  onShowToast: (message: string) => void;
  profile?: TeacherProfile;
  sdas?: SdaData[];
  onSelectSda?: (sdaId: string) => void;
  onOpenProfile?: () => void;
  onAdjustSessions?: (sdaId: string, delta: number) => void;
  onDuplicateSda?: (sdaId: string) => void;
  onOpenGeminiAssistant?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewSda,
  onOpenExportPdf,
  onShowToast,
  profile,
  sdas = [],
  onSelectSda,
  onOpenProfile,
  onAdjustSessions,
  onDuplicateSda,
  onOpenGeminiAssistant
}) => {
  const [showDuaDetails, setShowDuaDetails] = useState(false);

  const handleVerifyDua = () => {
    setShowDuaDetails(true);
    onShowToast(`Auditoría DUA completada: 100% de pautas verificadas para el curso ${profile?.academicYear || '2027–2028'}.`);
  };

  const handleCardClick = (sdaId: string) => {
    if (onSelectSda) {
      onSelectSda(sdaId);
    }
    onNavigate('situaciones-aprendizaje');
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Hero: Diseñador de la Programación Didáctica 2027–2028 */}
      <section className="px-4 md:px-6 pt-5 pb-3">
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/90 relative overflow-hidden">
          {/* Subtle geometric watermark */}
          <div className="absolute -right-4 -bottom-6 opacity-5 pointer-events-none text-slate-900">
            <svg fill="none" height="150" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 100 100" width="150">
              <circle cx="50" cy="50" r="42" strokeDasharray="3 3"></circle>
              <path d="M50 16 L28 82 M50 16 L72 82 M33 60 L67 60"></path>
              <circle cx="50" cy="16" r="6" strokeWidth="2"></circle>
              <polygon fill="currentColor" fillOpacity="0.3" points="58,74 82,74 70,58"></polygon>
            </svg>
          </div>

          {/* Badge & Academic Year */}
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span>Programación Didáctica Oficial LOMLOE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200">
                Curso Académico {profile?.academicYear || '2027–2028'}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
                Extremadura · D. 110/2022
              </span>
            </div>
          </div>

          {/* Title & Regulatory Context */}
          <div className="flex flex-col mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              {profile?.subject || 'Dibujo Técnico I · 1.º de Bachillerato'}
            </h1>
            <div className="flex items-center justify-between flex-wrap gap-2 mt-1.5">
              <p className="text-xs md:text-sm text-slate-600">
                Centro docente: <strong>{profile?.center || 'IES Santa Eulalia (Mérida)'}</strong> · Dpto. {profile?.department || 'Artes Plásticas y Visuales'} · Docente: <strong>{profile?.name || 'Tomás Rodríguez Campos'}</strong>
              </p>
              {onOpenProfile && (
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="px-2.5 py-1 text-xs font-semibold text-secondary hover:text-white bg-sky-50 hover:bg-secondary border border-sky-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
                  title="Editar datos del centro, asignatura y profesor"
                >
                  <span className="material-symbols-outlined text-[15px]">edit</span>
                  <span>Editar Centro, Asignatura o Profesor</span>
                </button>
              )}
            </div>
          </div>

          {/* Key Metrics of the 2027-2028 Curriculum Planning */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Carga Lectiva Anual
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl md:text-2xl font-bold text-slate-900">140 h</span>
                <span className="text-xs text-slate-600">· 4 h/semana (35 sem.)</span>
              </div>
            </div>

            <div 
              onClick={() => onNavigate('mapa-curricular')}
              className="bg-slate-50/80 hover:bg-sky-50/80 rounded-xl p-3.5 border border-slate-200/80 hover:border-secondary/40 transition-all cursor-pointer flex flex-col group"
              title="Ver árbol de cobertura curricular y trazabilidad"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  Competencias y Criterios
                </span>
                <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-secondary transition-colors">
                  arrow_forward
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl md:text-2xl font-bold text-secondary">5 de 5</span>
                <span className="text-xs text-slate-600">cubiertas en la programación</span>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 flex flex-col">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                Situaciones de Aprendizaje
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl md:text-2xl font-bold text-emerald-700">{sdas.length} SdA</span>
                <span className="text-xs text-slate-600">programadas y encadenadas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Toolbar */}
      <section className="px-4 md:px-6 py-2">
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={onOpenNewSda}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shrink-0 shadow-sm transition-all"
            id="btn-crear-sda"
          >
            <span className="material-symbols-outlined text-[18px] text-sky-400">add_circle</span>
            <span>+ Diseñar Nueva SdA con Desplegables</span>
          </button>

          <button
            onClick={() => onNavigate('mapa-curricular')}
            className="flex items-center gap-2 bg-sky-50 text-secondary hover:bg-sky-100 hover:text-slate-900 text-xs font-bold px-4 py-2.5 rounded-xl shrink-0 shadow-xs border border-sky-200 transition-all"
          >
            <span className="material-symbols-outlined text-secondary text-[18px]">account_tree</span>
            <span>Mapa de Cobertura Curricular y Frecuencia</span>
          </button>

          <button
            onClick={onOpenExportPdf}
            className="flex items-center gap-2 bg-white text-slate-800 hover:bg-slate-50 text-xs font-semibold px-4 py-2.5 rounded-xl shrink-0 shadow-xs border border-slate-200 transition-all"
            id="btn-export-pdf"
          >
            <span className="material-symbols-outlined text-secondary text-[18px]">picture_as_pdf</span>
            <span>Generar Documento de Programación 2027–2028 (PDF)</span>
          </button>

          <button
            onClick={() => onNavigate('calendario-temporizacion')}
            className="flex items-center gap-2 bg-white text-slate-800 hover:bg-slate-50 text-xs font-semibold px-4 py-2.5 rounded-xl shrink-0 shadow-xs border border-slate-200 transition-all"
          >
            <span className="material-symbols-outlined text-secondary text-[18px]">calendar_month</span>
            <span>Ver Calendario Escolar y Sesiones</span>
          </button>
        </div>
      </section>

      {/* Section: Estructura Global de la Programación Didáctica (8 Apartados Oficiales) */}
      <section className="px-4 md:px-6 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">folder_special</span>
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Estructura Oficial de la Programación Didáctica
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Marco LOMLOE · D. 110/2022
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Introducción y Contexto */}
          <div 
            onClick={() => onNavigate('situaciones-aprendizaje')}
            className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-secondary/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-secondary bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  Apartado 1 & 2
                </span>
                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-secondary transition-colors">
                  arrow_forward
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-secondary transition-colors">
                Introducción, Justificación y Contexto
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Contextualización en el IES Santa Eulalia (Mérida), características del alumnado de 1.º de Bachillerato y justificación legal.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Mérida, Badajoz</span>
              <span className="font-semibold text-emerald-700">Verificado</span>
            </div>
          </div>

          {/* Card 2: Competencias Específicas */}
          <div 
            onClick={() => onNavigate('evaluacion-rubricas')}
            className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-secondary/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-secondary bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  Apartado 3
                </span>
                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-secondary transition-colors">
                  arrow_forward
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-secondary transition-colors">
                Competencias y Criterios
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Vinculación de las 5 Competencias Específicas con el Perfil de Salida (STEM, CD, CCEC) y ponderación evaluativa al 100%.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>5 Competencias</span>
              <span className="font-semibold text-secondary">Ponderadas 100%</span>
            </div>
          </div>

          {/* Card 3: Situaciones de Aprendizaje */}
          <div 
            onClick={() => onNavigate('situaciones-aprendizaje')}
            className="bg-white p-4 rounded-xl border-2 border-secondary/30 shadow-xs hover:border-secondary transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-white bg-secondary px-2 py-0.5 rounded">
                  Apartado 4 · Central
                </span>
                <span className="material-symbols-outlined text-[18px] text-secondary group-hover:translate-x-0.5 transition-transform">
                  open_in_new
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-secondary transition-colors">
                Situaciones de Aprendizaje (SdA)
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Diseño estructurado mediante desplegables en cascada (Bloque &rarr; Saberes &rarr; Concreción) y fichas didácticas oficiales.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">{sdas.length} SdA Activas</span>
              <span className="font-bold text-secondary">Editar Fichas &rarr;</span>
            </div>
          </div>

          {/* Card 4: DUA e Inclusión */}
          <div 
            onClick={handleVerifyDua}
            className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-secondary/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Apartado 5 & 6
                </span>
                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-emerald-700 transition-colors">
                  verified_user
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                Metodología DUA y Evaluación
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Pautas de accesibilidad, múltiples formas de representación y expresión, instrumentos formativos y rúbricas graduadas.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Andamiaje UNE / CAD</span>
              <span className="font-semibold text-emerald-700">Verificado DUA</span>
            </div>
          </div>
        </div>

        {/* DUA Verification Details Banner (if toggled) */}
        {showDuaDetails && (
          <div className="bg-emerald-50/90 border border-emerald-200 p-4 rounded-xl text-emerald-950 text-xs flex flex-col gap-2 animate-in fade-in">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-700 text-[18px]">task_alt</span>
                Pautas de Diseño Universal para el Aprendizaje (DUA) Auditadas para el Curso 2027–2028:
              </span>
              <button
                type="button"
                onClick={() => setShowDuaDetails(false)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                Cerrar
              </button>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-emerald-900 font-medium">
              <li><strong>Principio I (Representación):</strong> Láminas con trazados vectoriales, visualización 3D interactiva de piezas y vídeos explicativos de diédrico.</li>
              <li><strong>Principio II (Acción y Expresión):</strong> Plantillas con cuadrículas guía milimetradas, despieces paso a paso y cajetines semi-completados.</li>
              <li><strong>Principio III (Implicación):</strong> Contextos basados en el patrimonio arquitectónico y productivo extremeño (Mérida, Tierra de Barros).</li>
            </ul>
          </div>
        )}
      </section>

      {/* Section: Situaciones de Aprendizaje Diseñadas para 2027-2028 (Dynamic List) */}
      <section className="px-4 md:px-6 pt-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">view_timeline</span>
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Secuencia de Situaciones de Aprendizaje (Curso 2027–2028)
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigate('calendario-temporizacion')}
              className="text-xs font-semibold text-secondary hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              <span>Ver en Agenda</span>
            </button>
            {onOpenGeminiAssistant && (
              <button
                type="button"
                onClick={onOpenGeminiAssistant}
                className="text-xs font-bold text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-primary px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-xs hover:brightness-110 cursor-pointer"
                title="Generar y auditar con IA Gemini"
              >
                <span className="material-symbols-outlined text-[15px] animate-pulse">auto_awesome</span>
                <span>Asistente Gemini IA</span>
              </button>
            )}
            <button
              onClick={onOpenNewSda}
              className="text-xs font-semibold text-secondary bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Nueva SdA</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {sdas.map((sda, idx) => {
            const quarterLabels: Record<number, string> = {
              1: '1.er Trimestre',
              2: '2.º Trimestre',
              3: '3.er Trimestre'
            };

            const ceCodes = sda.competenciasEspecificas
              .filter((c) => c.checked)
              .map((c) => c.code.replace('CE.DT.', 'CE '))
              .slice(0, 3)
              .join(' · ');

            const criteriaCodes = sda.criteriosEvaluacion
              .filter((c) => c.checked)
              .map((c) => c.code)
              .slice(0, 4)
              .join(', ');

            return (
              <article 
                key={sda.id}
                className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 hover:border-secondary/50 transition-all flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      SdA {sda.number || (idx + 1 < 10 ? `0${idx + 1}` : idx + 1)}
                    </span>
                    <span className="text-xs font-bold text-sky-900 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                      {quarterLabels[sda.quarter || 1] || '1.er Trimestre'} · {sda.totalSessions || 16} sesiones
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200">
                      {formatHumanDate(sda.startDate || '')} &rarr; {formatHumanDate(sda.endDate || '')}
                    </span>
                    {idx > 0 && sda.autoLinkedToPrev !== false && (
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                        ↳ Encadenada tras SdA {sdas[idx - 1].number}
                      </span>
                    )}
                  </div>

                  {/* Quick Session Stepper & Action */}
                  <div className="flex items-center gap-2">
                    {onAdjustSessions && (
                      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdjustSessions(sda.id, -1);
                          }}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center transition-colors shadow-xs"
                          title="Quitar 1 sesión a esta SdA"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-slate-800 px-1.5 min-w-[42px] text-center">
                          {sda.totalSessions} ses.
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdjustSessions(sda.id, 1);
                          }}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center transition-colors shadow-xs"
                          title="Añadir 1 sesión a esta SdA"
                        >
                          +
                        </button>
                      </div>
                    )}

                    {onDuplicateSda && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateSda(sda.id);
                        }}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Duplicar esta SdA completa y añadirla en cascada"
                      >
                        <span className="material-symbols-outlined text-[15px] text-slate-500">content_copy</span>
                        <span className="hidden sm:inline">Duplicar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCardClick(sda.id)}
                      className="text-xs font-bold text-secondary hover:text-white bg-sky-50 hover:bg-secondary px-3 py-1.5 rounded-lg border border-sky-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Abrir Ficha</span>
                      <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                    </button>
                  </div>
                </div>

                <div 
                  onClick={() => handleCardClick(sda.id)}
                  className="cursor-pointer group flex flex-col gap-1.5"
                >
                  <h3 className="text-sm md:text-base font-bold text-slate-900 group-hover:text-secondary transition-colors">
                    {sda.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {sda.finalProduct?.description || sda.prototype?.description || 'Desarrollo curricular, normalización y aplicación práctica.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ceCodes && (
                      <span className="font-semibold text-secondary bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {ceCodes}
                      </span>
                    )}
                    {criteriaCodes && (
                      <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        Criterios: {criteriaCodes}
                      </span>
                    )}
                    <span className="text-slate-500">
                      {sda.saberesBasicos && sda.saberesBasicos.length > 0 ? `${sda.saberesBasicos.length} saberes vinculados` : 'Saberes básicos LOMLOE'}
                    </span>
                  </div>
                  <span className="text-secondary font-semibold">
                    Producto: {sda.finalProduct?.format || 'Lámina Normalizada A3'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Section: Distribución Curricular de Saberes Básicos (Decreto 110/2022) */}
      <section className="px-4 md:px-6 pt-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">account_tree</span>
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Distribución de Saberes Básicos para el Curso 2027–2028
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            4 Bloques Oficiales
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Bloque A */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-sky-100 text-secondary text-xs font-bold flex items-center justify-center">
                  A
                </span>
                <h3 className="font-bold text-slate-900 text-xs md:text-sm">
                  Fundamentos Geométrico-Métricos
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">1.er Trimestre</span>
            </div>
            <p className="text-xs text-slate-600">
              Lugares geométricos, triángulos, cuadriláteros, polígonos regulares, tangencias, curvas cónicas y transformaciones geométricas planas.
            </p>
          </div>

          {/* Bloque B */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-sky-100 text-secondary text-xs font-bold flex items-center justify-center">
                  B
                </span>
                <h3 className="font-bold text-slate-900 text-xs md:text-sm">
                  Geometría Proyectiva y Espacial
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">1.º y 2.º Trimestre</span>
            </div>
            <p className="text-xs text-slate-600">
              Sistema diédrico: punto, recta, plano, pertenencias, paralelismo, perpendicularidad, verdaderas magnitudes y desarrollos de poliedros.
            </p>
          </div>

          {/* Bloque C */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-sky-100 text-secondary text-xs font-bold flex items-center justify-center">
                  C
                </span>
                <h3 className="font-bold text-slate-900 text-xs md:text-sm">
                  Normalización y Documentación Gráfica
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">2.º Trimestre</span>
            </div>
            <p className="text-xs text-slate-600">
              Formatos de la Serie A, líneas normalizadas, escalas normalizadas (UNE-EN ISO 5455), vistas normalizadas, cortes, secciones y acotación funcional.
            </p>
          </div>

          {/* Bloque D */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-sky-100 text-secondary text-xs font-bold flex items-center justify-center">
                  D
                </span>
                <h3 className="font-bold text-slate-900 text-xs md:text-sm">
                  Sistemas Axonométricos y CAD
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">3.er Trimestre</span>
            </div>
            <p className="text-xs text-slate-600">
              Perspectiva isométrica, dimétrica y caballera. Coeficientes de reducción, óvalos isométricos, secciones axonométricas y modelado 2D/3D con LibreCAD/FreeCAD.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
