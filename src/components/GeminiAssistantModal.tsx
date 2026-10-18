import React, { useState } from 'react';
import { SdaData, TeacherProfile } from '../types';
import {
  generateSdaWithGemini,
  generateActivityWithGemini,
  generateRubricWithGemini,
  auditCurriculumWithGemini,
  GeminiSdaResponse,
  GeminiActivityResponse,
  GeminiRubricResponse,
  GeminiAuditResponse
} from '../utils/geminiService';

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  sdas: SdaData[];
  profile: TeacherProfile;
  onInsertGeneratedSda: (sda: Partial<SdaData>) => void;
  onShowToast: (message: string) => void;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  sdas,
  profile,
  onInsertGeneratedSda,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'sda' | 'activity' | 'rubric' | 'audit'>('sda');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states - SdA
  const [sdaTopic, setSdaTopic] = useState('Estructura reticular de cubierta para una bodega bioclimática en Tierra de Barros');
  const [sdaQuarter, setSdaQuarter] = useState(2);
  const [sdaSessions, setSdaSessions] = useState(18);
  const [generatedSda, setGeneratedSda] = useState<GeminiSdaResponse | null>(null);

  // Form states - Activity
  const [actBlock, setActBlock] = useState('Bloque 2 · Geometría Descriptiva y Diédrico');
  const [actTopic, setActTopic] = useState('Abatimiento de planos oblicuos y determinación de verdaderas magnitudes de secciones');
  const [actDifficulty, setActDifficulty] = useState('Dificultad Media');
  const [generatedActivity, setGeneratedActivity] = useState<GeminiActivityResponse | null>(null);

  // Form states - Rubric
  const [critCode, setCritCode] = useState('2.1');
  const [critTitle, setCritTitle] = useState('Representar formas tridimensionales sobre planos bidimensionales mediante proyección diédrica ortogonal');
  const [generatedRubric, setGeneratedRubric] = useState<GeminiRubricResponse | null>(null);

  // Form states - Audit
  const [auditResult, setAuditResult] = useState<GeminiAuditResponse | null>(null);

  if (!isOpen) return null;

  // 1. Generate SdA
  const handleGenerateSda = async () => {
    if (!sdaTopic.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await generateSdaWithGemini(sdaTopic, sdaQuarter, sdaSessions, profile.center);
      setGeneratedSda(result);
      onShowToast('Situación de Aprendizaje generada con Gemini AI.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con la API de Gemini');
    } finally {
      setLoading(false);
    }
  };

  // Insert generated SdA into App
  const handleApplySda = () => {
    if (!generatedSda) return;

    const nextNum = sdas.length + 1;
    const numStr = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;

    const newSda: Partial<SdaData> = {
      title: generatedSda.title,
      quarter: generatedSda.quarter || sdaQuarter,
      totalSessions: generatedSda.totalSessions || sdaSessions,
      finalProduct: generatedSda.finalProduct,
      prototype: {
        ...generatedSda.prototype,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwPdsjlFqCK79szLrqjS6w9XzXuB1fp4H2xoV3tO_rWTv2bPonnAZKNrK3qhU1IOWCxvzeoLC6m8imz1z6wdgPkEoQwWbioBRkKejR7Nb5bYOpjaFSWWWfxMQPm1SrCC4uHqWVxPGFKJ7ZYPzrvJAOK-cY2DxcBCb6UPym3laDz_VHr4_AVUVRJCQtdcn_2f89GNKxejy-aoLbGsHRgm7xrH99qToSjmznPEdfU55LidYgbh9iaVwx'
      },
      competenciasEspecificas: generatedSda.competenciasEspecificas.map((ce, idx) => ({
        id: `ce-${idx + 1}`,
        code: ce.code,
        title: ce.title,
        description: ce.description || '',
        checked: true
      })),
      criteriosEvaluacion: generatedSda.criteriosEvaluacion.map((c, idx) => ({
        id: `cr-${idx + 1}`,
        code: c.code,
        title: c.title,
        checked: true
      })),
      saberesBasicos: generatedSda.saberesBasicos,
      dua: generatedSda.dua,
      autoLinkedToPrev: true
    };

    onInsertGeneratedSda(newSda);
    onClose();
  };

  // 2. Generate Activity
  const handleGenerateActivity = async () => {
    if (!actTopic.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await generateActivityWithGemini(actBlock, actTopic, actDifficulty);
      setGeneratedActivity(result);
      onShowToast('Lámina técnica generada con Gemini AI.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con la API de Gemini');
    } finally {
      setLoading(false);
    }
  };

  // 3. Generate Rubric
  const handleGenerateRubric = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await generateRubricWithGemini(critCode, critTitle);
      setGeneratedRubric(result);
      onShowToast('Niveles de rúbrica redactados con Gemini AI.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con la API de Gemini');
    } finally {
      setLoading(false);
    }
  };

  // 4. Audit Curriculum
  const handleAudit = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await auditCurriculumWithGemini(sdas, profile);
      setAuditResult(result);
      onShowToast('Auditoría pedagógica LOMLOE completada.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con la API de Gemini');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-primary text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-400 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-slate-950 text-[20px] font-bold">auto_awesome</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm md:text-base text-white">
                  Asistente Curricular con IA Gemini
                </h3>
                <span className="text-[10px] font-bold bg-white/20 text-sky-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  gemini-3.8-flash
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Alineado al Decreto 110/2022 de Extremadura · LOMLOE Dibujo Técnico I
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
            title="Cerrar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Feature Mode Tabs */}
        <div className="bg-slate-100 px-5 pt-3 pb-2 flex items-center justify-between border-b border-slate-200 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => { setActiveTab('sda'); setErrorMsg(null); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'sda' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">draw</span>
              <span>1. Diseñar SdA</span>
            </button>

            <button
              onClick={() => { setActiveTab('activity'); setErrorMsg(null); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'activity' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">architecture</span>
              <span>2. Crear Lámina Técnica</span>
            </button>

            <button
              onClick={() => { setActiveTab('rubric'); setErrorMsg(null); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'rubric' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">fact_check</span>
              <span>3. Redactar Rúbrica</span>
            </button>

            <button
              onClick={() => { setActiveTab('audit'); setErrorMsg(null); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'audit' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>4. Auditoría LOMLOE</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 flex flex-col gap-5">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: GENERATE SDA */}
          {activeTab === 'sda' && (
            <div className="flex flex-col gap-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-sky-900 text-xs flex flex-col gap-1">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                  Generador de Situaciones de Aprendizaje con Gemini AI:
                </span>
                <span>
                  Describe la temática o reto técnico y Gemini diseñará la SdA completa con alineación al Decreto 110/2022, competencias, criterios oficiales y pautas DUA.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Temática, contexto o problema de ingeniería / arquitectura:
                </label>
                <textarea
                  rows={2}
                  value={sdaTopic}
                  onChange={(e) => setSdaTopic(e.target.value)}
                  placeholder="Ej: Análisis y trazado de arcos y bóvedas en el Teatro Romano de Mérida..."
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Trimestre asignado:
                  </label>
                  <select
                    value={sdaQuarter}
                    onChange={(e) => setSdaQuarter(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value={1}>1.er Trimestre</option>
                    <option value={2}>2.º Trimestre</option>
                    <option value={3}>3.er Trimestre</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Sesiones estimadas:
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="40"
                    value={sdaSessions}
                    onChange={(e) => setSdaSessions(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateSda}
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    <span>Gemini AI está elaborando la propuesta curricular...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>Diseñar Situación de Aprendizaje con Gemini</span>
                  </>
                )}
              </button>

              {generatedSda && (
                <div className="mt-2 p-5 bg-white border-2 border-emerald-300 rounded-2xl shadow-sm flex flex-col gap-3 animate-in fade-in">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      Propuesta Generada · Trimestre {generatedSda.quarter} · {generatedSda.totalSessions} sesiones
                    </span>
                    <button
                      onClick={handleApplySda}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_task</span>
                      <span>Insertar en mi Programación</span>
                    </button>
                  </div>

                  <h4 className="font-bold text-base text-slate-900">
                    {generatedSda.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Producto final:</strong> {generatedSda.finalProduct.description} ({generatedSda.finalProduct.format}).
                  </p>

                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <strong>Criterios LOMLOE asociados:</strong>{' '}
                    {generatedSda.criteriosEvaluacion.map((c) => `Crit. ${c.code}: ${c.title}`).join(' | ')}
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <strong>Saberes básicos seleccionados:</strong>{' '}
                    {generatedSda.saberesBasicos.join(' · ')}
                  </div>

                  <div className="text-xs text-purple-900 bg-purple-50 p-3 rounded-xl border border-purple-200">
                    <strong>DUA (Inclusión):</strong> {generatedSda.dua.pauta1.title} · {generatedSda.dua.pauta1.description}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GENERATE TECHNICAL SHEET */}
          {activeTab === 'activity' && (
            <div className="flex flex-col gap-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-sky-900 text-xs">
                <span className="font-bold block mb-1">Generador de Enunciados Técnicos y Láminas:</span>
                Gemini generará un ejercicio con especificaciones técnicas rigurosas (instrumental, escala, pasos de resolución y criterios de evaluación).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Bloque curricular:</label>
                  <select
                    value={actBlock}
                    onChange={(e) => setActBlock(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="Bloque 1 · Geometría Plana y Tangencias">Bloque 1 · Geometría Plana</option>
                    <option value="Bloque 2 · Geometría Descriptiva y Diédrico">Bloque 2 · Sistema Diédrico</option>
                    <option value="Bloque 3 · Sistemas Axonométricos Normalizados">Bloque 3 · Axonometría</option>
                    <option value="Bloque 4 · Normalización, Cortes y Acotación">Bloque 4 · Normalización</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Nivel de dificultad:</label>
                  <select
                    value={actDifficulty}
                    onChange={(e) => setActDifficulty(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="Inicial / Nivel 1">Inicial / Nivel 1</option>
                    <option value="Dificultad Media">Dificultad Media (PAU/EBAU)</option>
                    <option value="Avanzada / Reto">Avanzada / Reto</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Contenido o reto técnico concreto:</label>
                <input
                  type="text"
                  value={actTopic}
                  onChange={(e) => setActTopic(e.target.value)}
                  placeholder="Ej: Determinación del ángulo de pendiente de una recta oblicua..."
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                />
              </div>

              <button
                onClick={handleGenerateActivity}
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    <span>Redactando lámina técnica...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>Generar Enunciado de Lámina con Gemini</span>
                  </>
                )}
              </button>

              {generatedActivity && (
                <div className="mt-2 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-900 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
                      {generatedActivity.format} · Escala: {generatedActivity.scale}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${generatedActivity.title}\n\n${generatedActivity.description}\n\nMateriales: ${generatedActivity.tools}\nEscala: ${generatedActivity.scale}\n\nPasos:\n${generatedActivity.stepByStep.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
                        );
                        onShowToast('Enunciado copiado al portapapeles.');
                      }}
                      className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      <span>Copiar Enunciado</span>
                    </button>
                  </div>

                  <h4 className="font-bold text-base text-slate-900">{generatedActivity.title}</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{generatedActivity.description}</p>

                  <div className="text-xs text-slate-600">
                    <strong>Instrumental requerido:</strong> {generatedActivity.tools}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold block mb-1 text-slate-900">Secuencia de resolución:</span>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                      {generatedActivity.stepByStep.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GENERATE RUBRIC */}
          {activeTab === 'rubric' && (
            <div className="flex flex-col gap-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-sky-900 text-xs">
                <span className="font-bold block mb-1">Graduación de Rúbricas por Criterios:</span>
                Introduce el código y título del criterio y Gemini redactará los 4 niveles de desempeño analítico (1: Insuficiente a 4: Sobresaliente).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Criterio:</label>
                  <input
                    type="text"
                    value={critCode}
                    onChange={(e) => setCritCode(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Enunciado oficial del criterio:</label>
                  <input
                    type="text"
                    value={critTitle}
                    onChange={(e) => setCritTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateRubric}
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    <span>Graduando niveles con Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>Redactar Matriz de Desempeño con Gemini</span>
                  </>
                )}
              </button>

              {generatedRubric && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 animate-in fade-in">
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs">
                    <span className="font-bold text-red-900 block mb-1">Nivel 1 · Insuficiente (1–4)</span>
                    <p className="text-red-950 leading-relaxed">{generatedRubric.level1}</p>
                  </div>
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs">
                    <span className="font-bold text-amber-900 block mb-1">Nivel 2 · Suficiente / Bien (5–6)</span>
                    <p className="text-amber-950 leading-relaxed">{generatedRubric.level2}</p>
                  </div>
                  <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs">
                    <span className="font-bold text-sky-900 block mb-1">Nivel 3 · Notable (7–8)</span>
                    <p className="text-sky-950 leading-relaxed">{generatedRubric.level3}</p>
                  </div>
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                    <span className="font-bold text-emerald-900 block mb-1">Nivel 4 · Sobresaliente (9–10)</span>
                    <p className="text-emerald-950 leading-relaxed">{generatedRubric.level4}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUDIT */}
          {activeTab === 'audit' && (
            <div className="flex flex-col gap-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-sky-900 text-xs">
                <span className="font-bold block mb-1">Auditoría Pedagógica LOMLOE y Decreto 110/2022:</span>
                Gemini analizará las {sdas.length} Situaciones de Aprendizaje programadas, el reparto de sesiones y la cobertura de criterios para emitir un dictamen de calidad antes de la entrega a la Inspección Educativa.
              </div>

              <button
                onClick={handleAudit}
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    <span>Auditando programación con Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">fact_check</span>
                    <span>Ejecutar Auditoría Curricular con Gemini</span>
                  </>
                )}
              </button>

              {auditResult && (
                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Índice de Alineación LOMLOE
                      </span>
                      <span className="text-2xl font-black text-emerald-700">
                        {auditResult.alignmentScore} / 100
                      </span>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full border border-emerald-300">
                      Dictamen Favorable
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>Resumen:</strong> {auditResult.summary}
                  </p>

                  <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-950 block mb-1">Puntos fuertes destacados:</span>
                    <ul className="list-disc pl-4 space-y-1 text-emerald-900">
                      {auditResult.strengths.map((str, i) => (
                        <li key={i}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 text-xs">
                    <span className="font-bold text-amber-950 block mb-1">Recomendaciones de mejora:</span>
                    <ul className="list-disc pl-4 space-y-1 text-amber-900">
                      {auditResult.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200 text-xs">
                    <span className="font-bold text-purple-950 block mb-1">Evaluación DUA (Inclusión):</span>
                    <p className="text-purple-900 leading-relaxed">{auditResult.duaAssessment}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Powered by Google Gemini API (@google/genai) · Servidor proxy Express
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
