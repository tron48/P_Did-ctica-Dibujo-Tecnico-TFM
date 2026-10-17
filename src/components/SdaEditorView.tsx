import React, { useState, useEffect } from 'react';
import { SdaData, NavTab } from '../types';
import { SdaDesigner } from './SdaDesigner';
import { CURRICULUM_CE_OPTIONS, CURRICULUM_BLOCK_OPTIONS } from '../data/curriculumStructure';
import { formatHumanDate } from '../utils/calendarScheduler';

interface SdaEditorViewProps {
  sda: SdaData;
  sdas?: SdaData[];
  onSelectSda?: (sdaId: string) => void;
  onUpdateSda: (updated: SdaData) => void;
  onUpdateSessionSchedule?: (sdaId: string, newTotalSessions: number, newStartDate?: string, autoLinked?: boolean) => void;
  onNavigate: (tab: NavTab) => void;
  onOpenBlueprint: (title: string, imageUrl: string) => void;
  onShowToast: (message: string) => void;
  onOpenNewSda?: () => void;
  onDuplicateSda?: (sdaId: string) => void;
}

export const SdaEditorView: React.FC<SdaEditorViewProps> = ({
  sda,
  sdas = [],
  onSelectSda,
  onUpdateSda,
  onUpdateSessionSchedule,
  onNavigate,
  onOpenBlueprint,
  onShowToast,
  onOpenNewSda,
  onDuplicateSda
}) => {
  const [activeMode, setActiveMode] = useState<'sheet' | 'designer'>('sheet');
  const [activeSection, setActiveSection] = useState<string>('all');
  const [title, setTitle] = useState(sda.title);
  const [timing, setTiming] = useState(sda.timing);
  const [quarter, setQuarter] = useState(sda.quarter || 2);
  const [totalSessions, setTotalSessions] = useState(sda.totalSessions || 16);
  const [level, setLevel] = useState(sda.educationalLevel || '1.º Bachillerato');

  // Keep local fields synchronized whenever the selected SdA changes
  useEffect(() => {
    setTitle(sda.title);
    setTiming(sda.timing);
    setQuarter(sda.quarter || 2);
    setTotalSessions(sda.totalSessions || 16);
    setLevel(sda.educationalLevel || '1.º Bachillerato');
  }, [sda.id, sda.title, sda.timing, sda.quarter, sda.totalSessions, sda.educationalLevel]);

  const handleAdjustSessions = (delta: number) => {
    const newSessions = Math.max(1, Math.min(60, totalSessions + delta));
    setTotalSessions(newSessions);
    if (onUpdateSessionSchedule) {
      onUpdateSessionSchedule(sda.id, newSessions, sda.startDate, sda.autoLinkedToPrev);
    } else {
      onUpdateSda({
        ...sda,
        totalSessions: newSessions
      });
    }
  };

  const handleStartDateChange = (newDate: string) => {
    if (!newDate) return;
    if (onUpdateSessionSchedule) {
      onUpdateSessionSchedule(sda.id, totalSessions, newDate, false);
    } else {
      onUpdateSda({
        ...sda,
        startDate: newDate,
        autoLinkedToPrev: false
      });
    }
  };

  const handleToggleAutoLinked = () => {
    const nextVal = sda.autoLinkedToPrev === false ? true : false;
    if (onUpdateSessionSchedule) {
      onUpdateSessionSchedule(sda.id, totalSessions, sda.startDate, nextVal);
    } else {
      onUpdateSda({
        ...sda,
        autoLinkedToPrev: nextVal
      });
    }
    onShowToast(
      nextVal
        ? 'Encadenamiento activado: la fecha de inicio se ajustará automáticamente tras finalizar la SdA anterior.'
        : 'Encadenamiento desactivado: fecha fijada manualmente.'
    );
  };

  // Inline cascading selection for Curricular Elements
  const [selectedCeId, setSelectedCeId] = useState<string>('ce-4');
  const [selectedCritId, setSelectedCritId] = useState<string>('crit-4-1');

  const [selectedBlockId, setSelectedBlockId] = useState<string>('block-c');
  const [selectedSaberId, setSelectedSaberId] = useState<string>('saber-c2');
  const [selectedSubblock, setSelectedSubblock] = useState<string>('');

  // Get current CE & criteria based on cascading dropdown
  const currentCeOption = CURRICULUM_CE_OPTIONS.find((c) => c.id === selectedCeId);
  const availableCriteria = currentCeOption ? currentCeOption.criteria : [];
  const currentCritOption = availableCriteria.find((cr) => cr.id === selectedCritId);

  // Get current Block, saberes & subbloques based on cascading dropdown
  const currentBlockOption = CURRICULUM_BLOCK_OPTIONS.find((b) => b.id === selectedBlockId);
  const availableSaberes = currentBlockOption ? currentBlockOption.saberes : [];
  const currentSaberOption = availableSaberes.find((s) => s.id === selectedSaberId) || (availableSaberes.length > 0 ? availableSaberes[0] : undefined);
  const availableSubblocks: string[] = currentSaberOption ? currentSaberOption.subbloques : [];

  // Toggle Competencia Especifica
  const handleToggleCe = (id: string) => {
    const updatedCes = sda.competenciasEspecificas.map((ce) =>
      ce.id === id ? { ...ce, checked: !ce.checked } : ce
    );
    onUpdateSda({ ...sda, competenciasEspecificas: updatedCes });
  };

  // Toggle Criterio
  const handleToggleCriterion = (id: string) => {
    const updatedCrits = sda.criteriosEvaluacion.map((crit) =>
      crit.id === id ? { ...crit, checked: !crit.checked } : crit
    );
    onUpdateSda({ ...sda, criteriosEvaluacion: updatedCrits });
  };

  // Add Saber from cascade
  const handleAddCascadingSaber = () => {
    const saberLabel = selectedSubblock || (currentSaberOption ? currentSaberOption.label : '');
    if (saberLabel && !sda.saberesBasicos.includes(saberLabel)) {
      onUpdateSda({
        ...sda,
        saberesBasicos: [...sda.saberesBasicos, saberLabel]
      });
      onShowToast(`Saber "${saberLabel.slice(0, 32)}..." añadido a la ficha.`);
    } else if (saberLabel) {
      onShowToast('El saber básico seleccionado ya está incluido en la programación.');
    }
  };

  // Remove saber
  const handleRemoveSaber = (saberToRemove: string) => {
    onUpdateSda({
      ...sda,
      saberesBasicos: sda.saberesBasicos.filter((s) => s !== saberToRemove)
    });
    onShowToast('Saber básico eliminado de la situación de aprendizaje.');
  };

  const handleSave = () => {
    onUpdateSda({
      ...sda,
      title,
      timing,
      quarter,
      totalSessions,
      educationalLevel: level
    });
    onShowToast('Ficha didáctica guardada en la Programación 2027–2028.');
  };

  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full px-4 md:px-6 pb-24">
      {/* SdA Selector / Switcher Tabs */}
      {sdas && sdas.length > 0 && (
        <div className="pt-3 pb-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar border-b border-slate-200">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">layers</span>
              SdAs:
            </span>
            {sdas.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSda && onSelectSda(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  s.id === sda.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span>{s.code} · {s.totalSessions} ses.</span>
              </button>
            ))}
          </div>

          {onOpenNewSda && (
            <button
              type="button"
              onClick={onOpenNewSda}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 bg-sky-50 text-secondary border border-sky-200 hover:bg-sky-100 flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>+ Nueva SdA</span>
            </button>
          )}
        </div>
      )}

      {/* Top Header Bar: Mode Switcher & Academic Year */}
      <div className="pt-3 pb-3 flex items-center justify-between gap-3 flex-wrap border-b border-slate-200">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveMode('sheet')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeMode === 'sheet'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">description</span>
            <span>Ficha Didáctica Oficial</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('designer')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeMode === 'designer'
                ? 'bg-secondary text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">account_tree</span>
            <span>Diseñador con Desplegables</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Curso 2027–2028
          </span>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Extremadura · D. 110/2022
          </span>
          {onDuplicateSda && (
            <button
              onClick={() => onDuplicateSda(sda.id)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Duplicar esta SdA y programarla a continuación"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">content_copy</span>
              <span>Duplicar</span>
            </button>
          )}
          <button
            onClick={handlePrintSheet}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Imprimir Ficha Didáctica"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
          </button>
        </div>
      </div>

      {/* When in Designer Mode: Display the Cascading Dropdowns Designer */}
      {activeMode === 'designer' ? (
        <div className="mt-4">
          <SdaDesigner
            initialTitle={title}
            initialTiming={timing}
            onSaveToApp={(designed) => {
              if (designed.title) setTitle(designed.title);
              if (designed.timing) setTiming(designed.timing);
              onUpdateSda({
                ...sda,
                title: designed.title || sda.title,
                timing: designed.timing || sda.timing
              });
              onShowToast('SdA sincronizada en la Ficha Didáctica de la programación.');
              setActiveMode('sheet');
            }}
            onShowToast={onShowToast}
          />
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-6">
          {/* Quick-Jump Clean Nav Pills (Sticky Table of Contents) */}
          <div className="sticky top-20 z-30 bg-slate-50/95 backdrop-blur-md py-2 border-b border-slate-200">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveSection('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeSection === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Ver Todo
              </button>
              <button
                onClick={() => setActiveSection('s1')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeSection === 's1'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                1. Identificación
              </button>
              <button
                onClick={() => setActiveSection('s2')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeSection === 's2'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                2. Contexto &amp; Reto
              </button>
              <button
                onClick={() => setActiveSection('s3')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeSection === 's3'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                3. Concreción Curricular
              </button>
              <button
                onClick={() => setActiveSection('s4')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeSection === 's4'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                4. Secuenciación
              </button>
              <button
                onClick={() => setActiveSection('s5')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeSection === 's5'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                5. Principios DUA
              </button>
              <button
                onClick={() => setActiveSection('s6')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeSection === 's6'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                6. Evaluación
              </button>
            </div>
          </div>

          {/* ================================================================ */}
          {/* APARTADO 1: DATOS IDENTIFICATIVOS Y TEMPORALIZACIÓN */}
          {/* ================================================================ */}
          {(activeSection === 'all' || activeSection === 's1') && (
            <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    1
                  </span>
                  <div>
                    <h2 className="text-sm md:text-base font-bold text-slate-900">
                      Datos Identificativos y Temporalización de la SdA
                    </h2>
                    <p className="text-xs text-slate-500">
                      Unidad de programación para Dibujo Técnico I en el Curso Académico 2027–2028
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-secondary bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                  {sda.code}
                </span>
              </div>

              <div className="p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Título oficial de la Situación de Aprendizaje
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-sm md:text-base font-bold text-slate-900 bg-white px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Materia y Curso
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-xs md:text-sm">
                      <span className="material-symbols-outlined text-[18px] text-secondary">architecture</span>
                      <span>Dibujo Técnico I · 1.º Bach.</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Trimestre
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-xs md:text-sm">
                      <span className="material-symbols-outlined text-[18px] text-secondary">calendar_today</span>
                      <select
                        value={quarter}
                        onChange={(e) => setQuarter(Number(e.target.value))}
                        className="bg-transparent border-none p-0 focus:outline-none font-semibold text-slate-900"
                      >
                        <option value={1}>1.er Trimestre (Sep - Dic)</option>
                        <option value={2}>2.º Trimestre (Ene - Mar)</option>
                        <option value={3}>3.er Trimestre (Abr - Jun)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Carga Lectiva Planificada
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-xs md:text-sm">
                      <span className="material-symbols-outlined text-[18px] text-secondary">schedule</span>
                      <input
                        type="text"
                        value={timing}
                        onChange={(e) => setTiming(e.target.value)}
                        className="bg-transparent border-none p-0 focus:outline-none w-full font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Scheduling & Cascade Controls (Requirement 8) */}
                <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-[18px]">event_repeat</span>
                      Temporización y Colocación en Calendario (4 h/semana: L, X, J, V)
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate('calendario-temporizacion')}
                      className="text-xs font-semibold text-secondary hover:text-sky-950 flex items-center gap-1"
                    >
                      <span>Ver distribución en el Calendario Escolar</span>
                      <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Fecha de inicio */}
                    <div className="flex flex-col gap-1 bg-white p-3 rounded-xl border border-sky-200 shadow-xs">
                      <label className="text-[11px] font-bold text-slate-700">
                        Fecha de Inicio en Calendario:
                      </label>
                      <input
                        type="date"
                        value={sda.startDate || '2027-09-15'}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className="text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg p-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-secondary"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        {sda.startDate ? formatHumanDate(sda.startDate) : 'Sin fecha fijada'}
                      </span>
                    </div>

                    {/* Stepper de Sesiones */}
                    <div className="flex flex-col gap-1 bg-white p-3 rounded-xl border border-sky-200 shadow-xs">
                      <label className="text-[11px] font-bold text-slate-700">
                        Sesiones Lectivas ({totalSessions} h):
                      </label>
                      <div className="flex items-center gap-1 mt-0.5">
                        <button
                          type="button"
                          onClick={() => handleAdjustSessions(-1)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center border border-slate-300 transition-colors"
                          title="Restar 1 sesión (desplaza fechas de siguientes SdAs)"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={60}
                          value={totalSessions}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val > 0) {
                              setTotalSessions(val);
                              if (onUpdateSessionSchedule) {
                                onUpdateSessionSchedule(sda.id, val, sda.startDate, sda.autoLinkedToPrev);
                              }
                            }
                          }}
                          className="w-16 text-center text-xs font-bold text-slate-900 border border-slate-300 rounded-lg p-1.5 bg-slate-50 focus:bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAdjustSessions(1)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center border border-slate-300 transition-colors"
                          title="Añadir 1 sesión (desplaza fechas de siguientes SdAs)"
                        >
                          +
                        </button>
                        <span className="text-xs text-slate-500 ml-1">ses.</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        Modificar sesiones recalcula las siguientes SdAs
                      </span>
                    </div>

                    {/* Fecha de Fin Estimada y Encadenamiento */}
                    <div className="flex flex-col gap-1 bg-white p-3 rounded-xl border border-sky-200 shadow-xs justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-700 block">
                          Fecha Fin Calculada:
                        </span>
                        <span className="text-xs font-bold text-emerald-700 mt-1 block">
                          {sda.endDate ? formatHumanDate(sda.endDate) : 'Calculando...'}
                        </span>
                      </div>
                      {sda.number !== '01' && (
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer pt-1.5 border-t border-slate-100">
                          <input
                            type="checkbox"
                            checked={sda.autoLinkedToPrev !== false}
                            onChange={handleToggleAutoLinked}
                            className="rounded border-slate-300 text-secondary focus:ring-secondary"
                          />
                          <span className="font-medium">Encadenar a SdA anterior</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* APARTADO 2: CONTEXTO, RETO Y PRODUCTO FINAL */}
          {/* ================================================================ */}
          {(activeSection === 'all' || activeSection === 's2') && (
            <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    2
                  </span>
                  <div>
                    <h2 className="text-sm md:text-base font-bold text-slate-900">
                      Contexto de Aprendizaje, Reto y Producto Final
                    </h2>
                    <p className="text-xs text-slate-500">
                      Planteamiento motivador del entorno productivo extremeño y especificaciones de entrega
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  {sda.finalProduct.format}
                </span>
              </div>

              <div className="p-5 flex flex-col gap-5">
                {/* Challenge description */}
                <div className="bg-slate-900 text-white rounded-xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                      Reto del Alumnado
                    </span>
                    <span className="text-xs text-slate-400">
                      Normativa: UNE-EN ISO 128 / 5455
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-slate-100">
                    {sda.finalProduct.description}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-sky-200">
                    <span className="material-symbols-outlined text-[16px] text-emerald-400">location_on</span>
                    <span><strong>Contextualización comarcal:</strong> {sda.finalProduct.context}</span>
                  </div>
                </div>

                {/* Technical Prototype Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div 
                    onClick={() => onOpenBlueprint(sda.prototype.title, sda.prototype.imageUrl)}
                    className="w-full sm:w-40 h-28 bg-white rounded-lg border border-slate-300 overflow-hidden shrink-0 relative group cursor-pointer shadow-xs"
                  >
                    <img
                      src={sda.prototype.imageUrl}
                      alt={sda.prototype.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-[24px]">zoom_in</span>
                    </div>
                    <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                      Plano CAD
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-sm">
                        {sda.prototype.title}
                      </h3>
                      <span className="text-xs text-secondary font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {sda.prototype.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {sda.prototype.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenBlueprint(sda.prototype.title, sda.prototype.imageUrl)}
                        className="text-xs font-semibold text-secondary hover:text-slate-900 flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>Examinar Plano Técnico en Alta Resolución</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* APARTADO 3: CONCRECIÓN CURRICULAR LOMLOE (CON DESPLEGABLES) */}
          {/* ================================================================ */}
          {(activeSection === 'all' || activeSection === 's3') && (
            <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    3
                  </span>
                  <div>
                    <h2 className="text-sm md:text-base font-bold text-slate-900">
                      Concreción Curricular LOMLOE (Decreto 110/2022 de Extremadura)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Selección de elementos mediante desplegables encadenados: Bloque &rarr; Saberes &rarr; Competencias &rarr; Criterios
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('mapa-curricular')}
                    className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-secondary border border-sky-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Ver mapa de cobertura y qué elementos faltan en toda la programación"
                  >
                    <span className="material-symbols-outlined text-[16px]">account_tree</span>
                    <span>Mapa de Cobertura Global</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMode('designer')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                    <span>Abrir Diseñador</span>
                  </button>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-6">
                {/* 3.1 INTERACTIVE CASCADING DROPDOWNS BAR */}
                <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-[18px]">account_tree</span>
                      <span>Selector Curricular con Desplegables Encadenados</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Al elegir un bloque se filtran automáticamente sus saberes
                    </span>
                  </div>

                  {/* Cascade Row 1: Saberes Básicos (Bloque -> Saberes -> Concreción) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-600">
                        1. Seleccionar Bloque de Saberes:
                      </label>
                      <select
                        value={selectedBlockId}
                        onChange={(e) => {
                          const newBlockId = e.target.value;
                          setSelectedBlockId(newBlockId);
                          const block = CURRICULUM_BLOCK_OPTIONS.find((b) => b.id === newBlockId);
                          if (block && block.saberes.length > 0) {
                            setSelectedSaberId(block.saberes[0].id);
                            setSelectedSubblock(block.saberes[0].subbloques.length > 0 ? block.saberes[0].subbloques[0] : '');
                          }
                        }}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary"
                      >
                        {CURRICULUM_BLOCK_OPTIONS.map((block) => (
                          <option key={block.id} value={block.id}>
                            {block.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-600">
                        2. Saber Básico Relacionado:
                      </label>
                      <select
                        value={selectedSaberId}
                        onChange={(e) => {
                          const newSabId = e.target.value;
                          setSelectedSaberId(newSabId);
                          const saber = availableSaberes.find((s) => s.id === newSabId);
                          if (saber && saber.subbloques.length > 0) {
                            setSelectedSubblock(saber.subbloques[0]);
                          }
                        }}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary truncate"
                      >
                        {availableSaberes.map((sab) => (
                          <option key={sab.id} value={sab.id}>
                            {sab.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-600">
                        3. Concreción / Subbloque Específico:
                      </label>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={selectedSubblock}
                          onChange={(e) => setSelectedSubblock(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary truncate"
                        >
                          {availableSubblocks.length > 0 ? (
                            availableSubblocks.map((sub, idx) => (
                              <option key={idx} value={sub}>
                                {sub}
                              </option>
                            ))
                          ) : (
                            <option value="">{currentSaberOption ? currentSaberOption.label : 'General'}</option>
                          )}
                        </select>
                        <button
                          type="button"
                          onClick={handleAddCascadingSaber}
                          className="px-3 py-2 bg-secondary text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors shrink-0 flex items-center gap-1"
                          title="Añadir saber seleccionado a la Ficha Didáctica"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                          <span>Añadir</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cascade Row 2: Competencias Específicas y Criterios */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-600">
                        Competencia Específica (C.E.):
                      </label>
                      <select
                        value={selectedCeId}
                        onChange={(e) => {
                          const newCeId = e.target.value;
                          setSelectedCeId(newCeId);
                          const ce = CURRICULUM_CE_OPTIONS.find((c) => c.id === newCeId);
                          if (ce && ce.criteria.length > 0) {
                            setSelectedCritId(ce.criteria[0].id);
                          }
                        }}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary truncate"
                      >
                        {CURRICULUM_CE_OPTIONS.map((ce) => (
                          <option key={ce.id} value={ce.id}>
                            {ce.code}: {ce.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-600">
                        Criterio de Evaluación Filtrado:
                      </label>
                      <select
                        value={selectedCritId}
                        onChange={(e) => setSelectedCritId(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary truncate"
                      >
                        {availableCriteria.map((cr) => (
                          <option key={cr.id} value={cr.id}>
                            {cr.label}
                          </option>
                        ))}
                      </select>
                      {currentCritOption && (
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          Perfil de Salida: <strong className="text-secondary">{currentCritOption.perfilSalida}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3.2 Competencias Específicas en la Ficha */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      <span>Competencias Específicas Seleccionadas para la SdA</span>
                    </h3>
                    <span className="text-xs text-slate-500">
                      {sda.competenciasEspecificas.filter((c) => c.checked).length} de {sda.competenciasEspecificas.length} activas
                    </span>
                  </div>

                  <div className="space-y-2">
                    {sda.competenciasEspecificas.map((ce) => (
                      <div
                        key={ce.id}
                        onClick={() => handleToggleCe(ce.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          ce.checked
                            ? 'bg-sky-50/50 border-sky-300'
                            : 'bg-slate-50/50 border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={ce.checked}
                          onChange={() => handleToggleCe(ce.id)}
                          className="mt-0.5 w-4 h-4 rounded text-secondary accent-secondary shrink-0 cursor-pointer"
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-secondary text-white">
                              {ce.code}
                            </span>
                            <span className="text-xs md:text-sm font-bold text-slate-900">
                              {ce.title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {ce.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3.3 Criterios de Evaluación */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span>Criterios de Evaluación Concretados</span>
                    </h3>
                    <span className="text-xs text-slate-500">
                      {sda.criteriosEvaluacion.filter((c) => c.checked).length} asignados
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {sda.criteriosEvaluacion.map((crit) => (
                      <div
                        key={crit.id}
                        onClick={() => handleToggleCriterion(crit.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                          crit.checked
                            ? 'bg-emerald-50/40 border-emerald-300'
                            : 'bg-slate-50 border-slate-200 opacity-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={crit.checked}
                          onChange={() => handleToggleCriterion(crit.id)}
                          className="mt-0.5 w-4 h-4 rounded text-emerald-600 accent-emerald-600 shrink-0 cursor-pointer"
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-800 text-white">
                              {crit.code}
                            </span>
                            <span className="text-xs font-semibold text-slate-900">
                              {crit.title}
                            </span>
                          </div>
                          {crit.description && (
                            <p className="text-[11px] text-slate-600 mt-1">
                              {crit.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3.4 Saberes Básicos Movilizados */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                      <span>Saberes Básicos Movilizados ({sda.saberesBasicos.length})</span>
                    </h3>
                    <span className="text-xs text-slate-500">
                      Usa el selector superior o pulsa la cruz para retirar
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sda.saberesBasicos.map((saber, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0"></span>
                          <span className="font-medium truncate">{saber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSaber(saber)}
                          className="text-slate-400 hover:text-red-600 p-0.5"
                          title="Eliminar saber"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3.5 Descriptores del Perfil de Salida */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    <span>Descriptores del Perfil de Salida Vinculados</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {sda.competenciasClave.map((cc) => (
                      <div
                        key={cc.code}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-secondary">
                            {cc.code}
                          </span>
                          <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                        </div>
                        <span className="text-[11px] text-slate-600 leading-tight">
                          {cc.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* APARTADO 4: SECUENCIACIÓN DIDÁCTICA (PLAN DE TRABAJO) */}
          {/* ================================================================ */}
          {(activeSection === 'all' || activeSection === 's4') && (
            <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    4
                  </span>
                  <div>
                    <h2 className="text-sm md:text-base font-bold text-slate-900">
                      Secuenciación Didáctica y Plan de Trabajo (16 Sesiones)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Fases pedagógicas de la situación de aprendizaje planificadas para el 2.º Trimestre de 2027–2028
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('calendario-temporizacion')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">calendar_month</span>
                  <span>Ver en Agenda</span>
                </button>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Fase 1 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-secondary">FASE 1 · Sesiones 1 a 4</span>
                    <span className="text-xs text-slate-500 font-medium">4 h lectivas</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs md:text-sm">
                    Introducción Teórica, Conceptos UNE y Croquizado Inicial
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Manejo de útiles de precisión, tipos de líneas normalizadas (UNE-EN ISO 128) y croquizado a mano alzada del soporte agrícola.
                  </p>
                </div>

                {/* Fase 2 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-secondary">FASE 2 · Sesiones 5 a 10</span>
                    <span className="text-xs text-slate-500 font-medium">6 h lectivas</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs md:text-sm">
                    Vistas Diédricas Normalizadas y Trazado Técnico
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Alzado, planta y perfil. Correspondencia proyectiva directa y trazado con portaminas 0.5 HB/2H y tinta calibrada.
                  </p>
                </div>

                {/* Fase 3 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-secondary">FASE 3 · Sesiones 11 a 14</span>
                    <span className="text-xs text-slate-500 font-medium">4 h lectivas</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs md:text-sm">
                    Acotación Funcional y Cortes por Plano Secante
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cotas de posición y dimensión sin redundancia. Secciones longitudinales y rayado técnico normalizado a 45°.
                  </p>
                </div>

                {/* Fase 4 */}
                <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/40 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">FASE 4 · Sesiones 15 y 16</span>
                    <span className="text-xs text-emerald-700 font-medium">2 h lectivas</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs md:text-sm">
                    Entrega Lámina A3 Normalizada y Coevaluación con Rúbrica
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Revisión de rotulación, cajetín oficial UNE 1035 de Extremadura y rúbrica formativa entre pares.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* APARTADO 5: MEDIDAS DUA E INCLUSIÓN */}
          {/* ================================================================ */}
          {(activeSection === 'all' || activeSection === 's5') && (
            <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    5
                  </span>
                  <div>
                    <h2 className="text-sm md:text-base font-bold text-slate-900">
                      Medidas de Inclusión y Principios DUA Aplicados
                    </h2>
                    <p className="text-xs text-slate-500">
                      Diseño Universal para el Aprendizaje: múltiples formas de representación y expresión
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Inclusión LOMLOE
                </span>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pauta 1 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                      {sda.dua.pauta1.title}
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-secondary">visibility</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {sda.dua.pauta1.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {sda.dua.pauta1.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pauta 2 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                      {sda.dua.pauta2.title}
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-secondary">grid_view</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {sda.dua.pauta2.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {sda.dua.pauta2.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* APARTADO 6: EVALUACIÓN Y INSTRUMENTOS */}
          {/* ================================================================ */}
          {(activeSection === 'all' || activeSection === 's6') && (
            <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    6
                  </span>
                  <div>
                    <h2 className="text-sm md:text-base font-bold text-slate-900">
                      Evaluación Formativa, Instrumentos y Calificación
                    </h2>
                    <p className="text-xs text-slate-500">
                      Ponderación de evidencias y rúbrica analítica del producto final
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('evaluacion-rubricas')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">rule</span>
                  <span>Ver Matriz de Rúbricas</span>
                </button>
              </div>

              <div className="p-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-lg font-bold text-secondary">40%</span>
                    <span className="block text-xs font-semibold text-slate-800 mt-0.5">Lámina A3 Técnica</span>
                    <span className="text-[10px] text-slate-500">Trazado y acotación</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-lg font-bold text-secondary">35%</span>
                    <span className="block text-xs font-semibold text-slate-800 mt-0.5">Prueba Gráfica</span>
                    <span className="text-[10px] text-slate-500">Resolución diédrica</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-lg font-bold text-secondary">15%</span>
                    <span className="block text-xs font-semibold text-slate-800 mt-0.5">Cuaderno Croquis</span>
                    <span className="text-[10px] text-slate-500">Mano alzada y notas</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-lg font-bold text-secondary">10%</span>
                    <span className="block text-xs font-semibold text-slate-800 mt-0.5">Coevaluación</span>
                    <span className="text-[10px] text-slate-500">Rúbrica entre pares</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Bottom Save Bar */}
          <div className="flex items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-600">
              Todos los cambios se registran en la programación del curso 2027–2028.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintSheet}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Imprimir Ficha
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-secondary hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Guardar Ficha en la Programación</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
