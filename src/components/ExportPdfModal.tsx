import React, { useState, useRef } from 'react';
import { TeacherProfile, SdaData, Student, StudentGradeRecord } from '../types';
import { formatHumanDate } from '../utils/calendarScheduler';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: TeacherProfile;
  sdas?: SdaData[];
  weights?: { ce1: number; ce2: number; ce3: number; ce4: number };
  students?: Student[];
  gradeRecords?: StudentGradeRecord[];
  onRestoreBackup?: (data: {
    profile?: TeacherProfile;
    sdas?: SdaData[];
    weights?: { ce1: number; ce2: number; ce3: number; ce4: number };
    students?: Student[];
    gradeRecords?: StudentGradeRecord[];
  }) => void;
  onShowToast?: (message: string) => void;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  profile,
  sdas = [],
  weights = { ce1: 25, ce2: 35, ce3: 30, ce4: 10 },
  students = [],
  gradeRecords = [],
  onRestoreBackup,
  onShowToast = () => {}
}) => {
  const [activeTab, setActiveTab] = useState<'dossier' | 'backup'>('dossier');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Export JSON Backup
  const handleExportJson = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      app: 'Norma & Trazo',
      academicYear: profile?.academicYear || '2027–2028',
      framework: 'Decreto 110/2022 de Extremadura',
      profile,
      weights,
      sdas,
      students,
      gradeRecords
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Programacion_DT1_${(profile?.center || 'IES_Santa_Eulalia').replace(/\s+/g, '_')}_2027_2028.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onShowToast('Copia de seguridad completa (.json) descargada.');
  };

  // Import JSON Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.sdas && onRestoreBackup) {
          onRestoreBackup({
            profile: json.profile,
            sdas: json.sdas,
            weights: json.weights,
            students: json.students,
            gradeRecords: json.gradeRecords
          });
          onShowToast('Programación y datos restaurados con éxito desde el archivo JSON.');
          onClose();
        } else {
          onShowToast('El archivo no contiene un formato de programación válido.');
        }
      } catch {
        onShowToast('Error al leer el archivo JSON. Verifica su contenido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white print:static">
      <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 print:max-w-none print:max-h-none print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-sky-400 text-[22px]">menu_book</span>
            <div>
              <h3 className="font-bold text-sm md:text-base text-white">
                Dossier Oficial de Programación Didáctica &amp; Copia de Seguridad
              </h3>
              <p className="text-[11px] text-slate-400">
                Conforme al Decreto 110/2022 de Extremadura · LOMLOE 2027–2028
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-secondary hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs (Hidden when printing) */}
        <div className="bg-slate-100 px-5 pt-3 pb-2 flex items-center justify-between border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setActiveTab('dossier')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dossier'
                  ? 'bg-secondary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">description</span>
              <span>Dossier Oficial para Inspección Educativa</span>
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'backup'
                  ? 'bg-secondary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">sync_saved_locally</span>
              <span>Copia de Seguridad y Portabilidad (JSON)</span>
            </button>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            {sdas.length} SdAs · {students.length} Alumnos
          </span>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-6 md:p-8 bg-white text-slate-900 font-sans leading-relaxed text-xs md:text-sm print:p-0 print:overflow-visible">
          {activeTab === 'backup' ? (
            <div className="flex flex-col gap-6 max-w-2xl mx-auto py-6">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 text-sky-950 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-bold text-sm text-sky-900">
                  <span className="material-symbols-outlined text-[22px]">cloud_sync</span>
                  <span>Portabilidad Total y Copia de Seguridad</span>
                </div>
                <p className="text-xs leading-relaxed text-sky-900">
                  Guarda una copia exacta de toda tu programación didáctica (perfil del profesor y centro, todas las Situaciones de Aprendizaje con sus fechas calculadas, ponderaciones, alumnos y calificaciones del cuaderno). Podrás restaurarla en cualquier momento o compartirla con otros profesores de tu departamento.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4">
                  <div>
                    <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[20px]">file_download</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Descargar Copia (.json)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Genera un archivo JSON con toda la base de datos de tu curso escolar 2027–2028.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJson}
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Descargar Backup JSON</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4">
                  <div>
                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[20px]">file_upload</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Restaurar Copia (.json)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Carga un archivo de respaldo previo para restablecer todas las SdAs y calificaciones.
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".json"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">upload_file</span>
                      <span>Seleccionar Archivo JSON</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 print:gap-4">
              {/* Official Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                    EX
                  </div>
                  <div>
                    <h1 className="font-bold text-xs md:text-sm tracking-wide text-slate-900 uppercase">
                      CONSEJERÍA DE EDUCACIÓN Y EMPLEO · JUNTA DE EXTREMADURA
                    </h1>
                    <h2 className="font-medium text-xs text-slate-700">
                      {profile?.center ? profile.center.toUpperCase() : 'IES SANTA EULALIA (MÉRIDA)'}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      DEPARTAMENTO DE {profile?.department ? profile.department.toUpperCase() : 'ARTES PLÁSTICAS Y DIBUJO TÉCNICO'}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    CURSO ACADÉMICO {profile?.academicYear || '2027 / 2028'}
                  </div>
                  <div className="text-slate-600 mt-1">
                    {profile?.subject ? profile.subject.toUpperCase() : 'DIBUJO TÉCNICO I · 1.º BACHILLERATO'}
                  </div>
                  <div className="text-emerald-700 font-semibold">NORMATIVA: DECRETO 110/2022</div>
                </div>
              </div>

              {/* Title & Presentation */}
              <div className="text-center py-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Documento Oficial de Programación de Aula LOMLOE
                </span>
                <h2 className="text-base md:text-lg font-black text-slate-900">
                  PROGRAMACIÓN DIDÁCTICA DE DIBUJO TÉCNICO I
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Profesorado responsable: <strong>{profile?.name || 'Tomás Rodríguez Campos'}</strong> ({profile?.role || 'Catedrático'}) · {profile?.hours || '4 h/semana'}
                </p>
              </div>

              {/* Section 1: Introduction & Regulations */}
              <section className="break-inside-avoid">
                <h3 className="font-bold text-xs md:text-sm text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">
                  1. Marco Normativo y Contextualización
                </h3>
                <p className="text-justify text-xs mb-2 text-slate-700 leading-relaxed">
                  La presente Programación Didáctica para el <strong>curso académico 2027–2028</strong> se fundamenta en la Ley Orgánica 3/2020 (LOMLOE), el Real Decreto 243/2022 de enseñanzas mínimas del Bachillerato y el <strong>Decreto 110/2022, de 22 de agosto</strong>, por el que se regulan la ordenación y el currículo de la Educación Secundaria Obligatoria y del Bachillerato para la Comunidad Autónoma de Extremadura.
                </p>
                <p className="text-justify text-xs text-slate-700 leading-relaxed">
                  Se imparte en el centro <strong>{profile?.center || 'IES Santa Eulalia de Mérida'}</strong> con una carga horaria de <strong>{profile?.hours || '4 horas semanales'}</strong> (140 horas lectivas anuales) para los itinerarios de Ciencias y Tecnología y Bachillerato General/Artes.
                </p>
              </section>

              {/* Section 2: Weightings Table */}
              <section className="break-inside-avoid">
                <h3 className="font-bold text-xs md:text-sm text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">
                  2. Concreción Curricular: Competencias Específicas y Ponderación Oficial
                </h3>
                <table className="w-full text-xs border border-slate-300 mb-2">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                      <th className="p-2 text-left">Competencia Específica (C.E.)</th>
                      <th className="p-2 text-left">Criterios de Evaluación Vinculados</th>
                      <th className="p-2 text-center w-24">Ponderación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-medium">C.E. 1 · Geometría Métrica y Construcciones Planas</td>
                      <td className="p-2 text-slate-600">1.1, 1.2, 1.3, 1.4 (Tangencias, enlaces, polígonos, curvas cónicas)</td>
                      <td className="p-2 text-center font-bold text-slate-900">{weights.ce1}%</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-medium">C.E. 2 · Sistemas de Representación y Diédrico Ortogonal</td>
                      <td className="p-2 text-slate-600">2.1, 2.2, 2.3 (Punto, recta, plano, giros, abatimientos y distancias)</td>
                      <td className="p-2 text-center font-bold text-slate-900">{weights.ce2}%</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-medium">C.E. 3 · Sistemas Axonométricos Normalizados</td>
                      <td className="p-2 text-slate-600">3.1, 3.2, 3.3 (Perspectiva isométrica, caballera, cortes al cuarto)</td>
                      <td className="p-2 text-center font-bold text-slate-900">{weights.ce3}%</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-medium">C.E. 4 · Normalización Técnica, Vistas y Acotación (UNE-ISO)</td>
                      <td className="p-2 text-slate-600">4.1, 4.2 (Acotación funcional, formatos Serie A, vistas, cortes y rotulaciones)</td>
                      <td className="p-2 text-center font-bold text-slate-900">{weights.ce4}%</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold border-t border-slate-300">
                      <td className="p-2" colSpan={2}>TOTAL PONDERACIÓN CURRICULAR OFICIAL</td>
                      <td className="p-2 text-center text-emerald-800 font-black">
                        {weights.ce1 + weights.ce2 + weights.ce3 + weights.ce4}% CERRADO
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>

              {/* Section 3: SDAs Detailed Summary */}
              <section className="break-inside-avoid">
                <h3 className="font-bold text-xs md:text-sm text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">
                  3. Secuencia Oficial de Situaciones de Aprendizaje (SdA) · 2027–2028
                </h3>
                <div className="space-y-3 text-xs">
                  {sdas.map((s, idx) => {
                    const activeCrits = s.criteriosEvaluacion?.filter((c) => c.checked) || [];
                    const activeSaberes = s.saberesBasicos || [];

                    return (
                      <div key={s.id} className="p-3.5 border border-slate-200 rounded-xl bg-white shadow-2xs break-inside-avoid">
                        <div className="flex items-center justify-between font-bold text-slate-900 mb-1 flex-wrap gap-2">
                          <span className="text-sm">{s.code}: {s.title}</span>
                          <span className="text-secondary font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {s.quarter}.º Trimestre · {s.totalSessions} sesiones ({formatHumanDate(s.startDate || '')} a {formatHumanDate(s.endDate || '')})
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed mt-1">
                          <strong>Contexto y Producto:</strong> {s.finalProduct?.description || s.prototype?.description || 'Desarrollo curricular, normalización y aplicación práctica LOMLOE.'} (Formato: <em>{s.finalProduct?.format || 'Lámina Normalizada A3'}</em>).
                        </p>
                        
                        {activeCrits.length > 0 && (
                          <div className="mt-2 text-[11px] text-slate-600">
                            <strong>Criterios Evaluables:</strong>{' '}
                            {activeCrits.map((c) => `Crit. ${c.code}`).join(', ')}
                          </div>
                        )}

                        {activeSaberes.length > 0 && (
                          <div className="mt-1 text-[11px] text-slate-600">
                            <strong>Saberes Básicos:</strong>{' '}
                            {activeSaberes.slice(0, 3).join(' · ')}
                          </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-800">
                          <span><strong>DUA:</strong> {s.dua?.pauta1?.title || 'Múltiples formas de representación'}</span>
                          <span className="font-semibold text-slate-500">
                            {s.autoLinkedToPrev !== false && idx > 0 ? '↳ Encadenada en calendario' : 'Inicio personalizado'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Section 4: Attention to Diversity and DUA */}
              <section className="break-inside-avoid">
                <h3 className="font-bold text-xs md:text-sm text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">
                  4. Medidas de Atención a la Diversidad e Inclusión (DUA)
                </h3>
                <p className="text-justify text-xs text-slate-700 leading-relaxed mb-2">
                  La programación incorpora de manera transversal los principios del Diseño Universal para el Aprendizaje (DUA):
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                  <li><strong>Múltiples formas de representación:</strong> Recursos complementarios en 3D (simuladores diédricos), láminas con código cromático de trazos auxiliares y despieces secuenciados.</li>
                  <li><strong>Múltiples formas de acción y expresión:</strong> Opciones de entrega tanto tradicional a tinta/lápiz como delineación vectorial CAD 2D/3D.</li>
                  <li><strong>Múltiples formas de implicación:</strong> Vinculación directa con problemas reales del patrimonio monumental e industrial de Extremadura.</li>
                </ul>
              </section>

              {/* Signatures */}
              <div className="mt-6 pt-4 border-t border-slate-300 flex justify-between text-xs break-inside-avoid">
                <div>
                  <p className="font-bold">El Docente / Jefe de Departamento:</p>
                  <div className="h-12 flex items-end text-slate-800 italic font-serif">
                    D. {profile?.name || 'Tomás Rodríguez Campos'}
                  </div>
                  <p className="text-[11px] text-slate-500">{profile?.role || 'Catedrático de Dibujo Técnico'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">V.º B.º La Dirección del Centro:</p>
                  <div className="h-12 flex items-end justify-end text-slate-800 italic font-serif">
                    Dña. Elena Gómez Morales
                  </div>
                  <p className="text-[11px] text-slate-500">Mérida, Septiembre de 2027</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Toolbar (Hidden when printing) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500 font-medium">
            Programación validada según Decreto 110/2022 de Extremadura · IES Santa Eulalia.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-secondary hover:bg-sky-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Imprimir Dossier Oficial</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
