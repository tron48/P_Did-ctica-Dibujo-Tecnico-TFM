import React, { useState, useEffect } from 'react';
import { SdaData, SdaTemplate } from '../types';
import { SDA_TEMPLATES } from '../data/curriculumData';
import {
  getNextTeachingDayAfter,
  parseDateStr,
  formatDateStr,
  calculateSdaSessionDates,
  formatHumanDate,
  getQuarterFromDate
} from '../utils/calendarScheduler';
import { SdaDesigner } from './SdaDesigner';

interface NewSdaModalProps {
  isOpen: boolean;
  onClose: () => void;
  sdas: SdaData[];
  onCreated: (newSda: Partial<SdaData>) => void;
  onShowToast: (message: string) => void;
}

export const NewSdaModal: React.FC<NewSdaModalProps> = ({
  isOpen,
  onClose,
  sdas,
  onCreated,
  onShowToast
}) => {
  const [creationTab, setCreationTab] = useState<'config' | 'templates'>('config');
  const [title, setTitle] = useState('');
  const [totalSessions, setTotalSessions] = useState(16);
  const [startDate, setStartDate] = useState('');
  const [autoLinked, setAutoLinked] = useState(true);
  const [showCurriculumDesigner, setShowCurriculumDesigner] = useState(false);
  const [designedCurriculum, setDesignedCurriculum] = useState<Partial<SdaData>>({});

  // Compute default suggested start date based on previous SDA
  const prevSda = sdas.length > 0 ? sdas[sdas.length - 1] : null;

  useEffect(() => {
    if (isOpen) {
      const nextNum = sdas.length + 1;
      const defaultTitle = `SDA ${nextNum}: Nueva Unidad de Dibujo Técnico`;
      setTitle(defaultTitle);
      setTotalSessions(16);
      setShowCurriculumDesigner(false);
      setDesignedCurriculum({});
      setCreationTab('config');

      let suggestedStart = '2027-09-15';
      if (prevSda && prevSda.endDate) {
        try {
          const nextDate = getNextTeachingDayAfter(parseDateStr(prevSda.endDate));
          suggestedStart = formatDateStr(nextDate);
        } catch {
          suggestedStart = '2028-01-10';
        }
      }
      setStartDate(suggestedStart);
      setAutoLinked(true);
    }
  }, [isOpen, sdas.length, prevSda]);

  const handleSelectTemplate = (template: SdaTemplate) => {
    const nextNum = sdas.length + 1;
    setTitle(`SDA ${nextNum}: ${template.title}`);
    setTotalSessions(template.totalSessions);
    setDesignedCurriculum({
      finalProduct: template.finalProduct,
      prototype: template.prototype,
      competenciasEspecificas: [
        {
          id: 'ce1',
          code: 'CE.DT.1',
          title: 'Fundamentos Geométrico-Métricos',
          description: 'Resolver problemas métricos en construcciones planas.',
          checked: template.ceCodes.includes('CE.DT.1')
        },
        {
          id: 'ce2',
          code: 'CE.DT.2',
          title: 'Sistemas de Representación Espacial',
          description: 'Representar formas tridimensionales mediante proyección ortogonal.',
          checked: template.ceCodes.includes('CE.DT.2')
        },
        {
          id: 'ce3',
          code: 'CE.DT.3',
          title: 'Normalización e Interpretación de Planos',
          description: 'Aplicar normas UNE e ISO en croquis y planos.',
          checked: template.ceCodes.includes('CE.DT.3')
        },
        {
          id: 'ce4',
          code: 'CE.DT.4',
          title: 'Metodología de Proyectos y Prototipado',
          description: 'Elaborar documentación gráfica técnica para fabricación.',
          checked: template.ceCodes.includes('CE.DT.4')
        }
      ],
      criteriosEvaluacion: template.criterionCodes.map((code) => ({
        id: `cr-${code.replace('.', '')}`,
        code,
        title: `Criterio ${code} del currículo oficial LOMLOE`,
        checked: true
      })),
      saberesBasicos: template.saberes,
      dua: template.dua
    });
    setCreationTab('config');
    onShowToast(`Plantilla "${template.badge}" cargada. Ajusta sesiones y confirma.`);
  };

  if (!isOpen) return null;

  // Live schedule preview calculation
  let calculatedEndDate = '';
  let calculatedQuarter = 1;
  if (startDate) {
    try {
      const schedule = calculateSdaSessionDates(startDate, totalSessions);
      calculatedEndDate = schedule.endDate;
      calculatedQuarter = getQuarterFromDate(schedule.startDate);
    } catch {
      // fallback
    }
  }

  const handleAdjustSessions = (delta: number) => {
    setTotalSessions((prev) => Math.max(1, Math.min(60, prev + delta)));
  };

  const handleSave = () => {
    if (!title.trim()) {
      onShowToast('Por favor, indica un título para la Situación de Aprendizaje.');
      return;
    }

    const nextNum = sdas.length + 1;
    const numStr = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;

    const newSda: Partial<SdaData> = {
      ...designedCurriculum,
      id: `sda-${Date.now()}`,
      number: numStr,
      code: `SDA.DT1.${numStr}`,
      title: title.trim(),
      totalSessions,
      startDate,
      endDate: calculatedEndDate,
      autoLinkedToPrev: autoLinked,
      quarter: calculatedQuarter,
      educationalLevel: '1.º Bachillerato',
      timing: `${totalSessions} ses. (${formatHumanDate(startDate)} a ${formatHumanDate(calculatedEndDate)})`
    };

    onCreated(newSda);
    onShowToast(`SdA "${title.slice(0, 30)}..." creada y programada en el calendario.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-sky-400 text-[22px]">calendar_add_on</span>
            <div>
              <h3 className="font-bold text-sm md:text-base text-white">
                Diseñar y Programar Nueva Situación de Aprendizaje
              </h3>
              <p className="text-xs text-slate-400">
                Temporización inteligente y encadenamiento automático de sesiones (Curso 2027–2028)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
            title="Cerrar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Navigation Tabs: Manual vs Plantillas LOMLOE */}
        <div className="bg-slate-100 px-5 pt-3 pb-2 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => setCreationTab('config')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                creationTab === 'config'
                  ? 'bg-secondary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Configuración y Fechas</span>
            </button>
            <button
              type="button"
              onClick={() => setCreationTab('templates')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                creationTab === 'templates'
                  ? 'bg-secondary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">library_books</span>
              <span>Catálogo de Plantillas Oficiales LOMLOE</span>
              <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {SDA_TEMPLATES.length}
              </span>
            </button>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Decreto 110/2022 · Junta de Extremadura
          </span>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 flex flex-col gap-5">
          {creationTab === 'templates' ? (
            <div className="flex flex-col gap-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-sky-900 text-xs">
                <span className="font-bold flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Plantillas Didácticas Oficiales para 1.º de Bachillerato:
                </span>
                Selecciona una plantilla para cargar automáticamente sus competencias específicas, criterios de evaluación, saberes básicos, producto final y adaptaciones DUA.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SDA_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-white border-2 border-slate-200 hover:border-secondary rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold text-sky-800 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-full uppercase">
                          {tpl.badge}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          Trimestre {tpl.quarter} · {tpl.totalSessions} ses.
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-secondary transition-colors line-clamp-2">
                        {tpl.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                        {tpl.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {tpl.ceCodes.map((ce) => (
                          <span key={ce} className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                            {ce}
                          </span>
                        ))}
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                          {tpl.criterionCodes.length} Criterios
                        </span>
                        <span className="text-[10px] bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded font-medium">
                          DUA P1 &amp; P2
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 line-clamp-1 max-w-[180px]">
                        {tpl.finalProduct.format}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectTemplate(tpl)}
                        className="px-3 py-1.5 bg-secondary hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Usar Plantilla</span>
                        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Section 1: Identification & Timing Settings */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <span>1. Temporización y Colocación en el Calendario</span>
                  </span>
              <span className="text-xs bg-sky-100 text-sky-900 font-semibold px-2.5 py-0.5 rounded-md border border-sky-200">
                Horario DT1: 4h/semana (L, X, J, V)
              </span>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Denominación / Título de la SdA:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. SDA 4: Trazado técnico y sistemas axonométricos en piezas de precisión"
                className="w-full text-sm font-bold text-slate-900 bg-white px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              />
            </div>

            {/* Grid: Sessions & Start Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sessions Selector with +/- buttons */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  ¿Cuántas sesiones lectivas abarca?
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdjustSessions(-1)}
                    className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg flex items-center justify-center transition-colors"
                    title="Quitar 1 sesión"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={totalSessions}
                    onChange={(e) => setTotalSessions(Math.max(1, Number(e.target.value)))}
                    className="w-20 text-center font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-lg py-1.5 focus:outline-none focus:border-secondary"
                  />
                  <button
                    type="button"
                    onClick={() => handleAdjustSessions(1)}
                    className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg flex items-center justify-center transition-colors"
                    title="Añadir 1 sesión"
                  >
                    +
                  </button>
                  <span className="text-xs text-slate-500 font-medium ml-1">
                    sesiones (1h cada una)
                  </span>
                </div>
                {/* Quick presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400">Ajustes rápidos:</span>
                  {[12, 16, 20, 24].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTotalSessions(n)}
                      className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors ${
                        totalSessions === n
                          ? 'bg-secondary text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {n} ses.
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Date Selector */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  Fecha de inicio de la SdA:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setAutoLinked(false); // User manually changed date
                  }}
                  className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-secondary"
                />

                {prevSda && (
                  <div className="flex items-start gap-2 text-xs pt-1">
                    <input
                      type="checkbox"
                      id="chk-auto-link"
                      checked={autoLinked}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAutoLinked(checked);
                        if (checked && prevSda.endDate) {
                          const nextDate = getNextTeachingDayAfter(parseDateStr(prevSda.endDate));
                          setStartDate(formatDateStr(nextDate));
                        }
                      }}
                      className="mt-0.5 w-4 h-4 rounded text-secondary accent-secondary"
                    />
                    <label htmlFor="chk-auto-link" className="text-slate-600 cursor-pointer">
                      <strong>Encadenar automáticamente:</strong> empezar al día lectivo siguiente a la finalización de la <em>SdA {prevSda.number}</em> ({prevSda.endDate ? formatHumanDate(prevSda.endDate) : 'anterior'}).
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Calculated Date Range Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-emerald-700 text-[22px]">date_range</span>
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">
                    Periodo programado en el calendario:
                  </span>
                  <span className="text-xs text-emerald-800">
                    Del <strong>{formatHumanDate(startDate)}</strong> al <strong>{formatHumanDate(calculatedEndDate)}</strong>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-md border border-emerald-300">
                  {calculatedQuarter}.er Trimestre
                </span>
                <span className="text-xs font-semibold text-emerald-800">
                  {totalSessions} días lectivos computados
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Optional Curricular Concrete Details with Cascading Dropdowns */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowCurriculumDesigner(!showCurriculumDesigner)}
              className="w-full bg-slate-50 hover:bg-slate-100 p-4 text-left flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">account_tree</span>
                <span className="text-xs md:text-sm font-bold text-slate-900">
                  2. Concreción Curricular LOMLOE (Desplegables Encadenados)
                </span>
                <span className="text-xs text-slate-500 font-normal">
                  (Opcional: puedes definirlo ahora o más tarde en la Ficha)
                </span>
              </div>
              <span className="material-symbols-outlined text-[20px] text-slate-500">
                {showCurriculumDesigner ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {showCurriculumDesigner && (
              <div className="p-4 bg-white border-t border-slate-200">
                <SdaDesigner
                  initialTitle={title}
                  initialTiming={`${totalSessions} sesiones`}
                  onSaveToApp={(designed) => {
                    setDesignedCurriculum(designed);
                    if (designed.title) setTitle(designed.title);
                    onShowToast('Concreción curricular guardada para la nueva SdA.');
                  }}
                  onShowToast={onShowToast}
                />
              </div>
            )}
          </div>
            </>
          )}
        </div>

        {/* Modal Footer Toolbar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Se programarán automáticamente las {totalSessions} sesiones en el calendario escolar.
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-secondary hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Crear e Insertar en el Calendario</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
