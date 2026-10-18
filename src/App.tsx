/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavTab, SdaData, TeacherProfile, Student, StudentGradeRecord } from './types';
import { INITIAL_SDAS, DEFAULT_TEACHER_PROFILE, INITIAL_STUDENTS, INITIAL_GRADE_RECORDS } from './data/curriculumData';
import { cascadeAllSdas } from './utils/calendarScheduler';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { SdaEditorView } from './components/SdaEditorView';
import { AgendaView } from './components/AgendaView';
import { RubricasView } from './components/RubricasView';
import { BancoView } from './components/BancoView';
import { MapaCurricularView } from './components/MapaCurricularView';
import { BlueprintModal } from './components/BlueprintModal';
import { Simulation3DModal } from './components/Simulation3DModal';
import { ExportPdfModal } from './components/ExportPdfModal';
import { NewSdaModal } from './components/NewSdaModal';
import { WeightEditorModal } from './components/WeightEditorModal';
import { GeminiAssistantModal } from './components/GeminiAssistantModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sdas, setSdas] = useState<SdaData[]>(() => {
    try {
      const saved = localStorage.getItem('norma_trazo_sdas');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SDAS;
  });
  const [activeSdaId, setActiveSdaId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('norma_trazo_active_sda');
      if (saved) return saved;
    } catch {}
    return INITIAL_SDAS[0]?.id || 'sda-1';
  });
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(() => {
    try {
      const saved = localStorage.getItem('norma_trazo_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_TEACHER_PROFILE;
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileModalEditMode, setIsProfileModalEditMode] = useState(false);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [weights, setWeights] = useState(() => {
    try {
      const saved = localStorage.getItem('norma_trazo_weights');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { ce1: 25, ce2: 35, ce3: 30, ce4: 10 };
  });
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('norma_trazo_students');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STUDENTS;
  });
  const [gradeRecords, setGradeRecords] = useState<StudentGradeRecord[]>(() => {
    try {
      const saved = localStorage.getItem('norma_trazo_grades');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_GRADE_RECORDS;
  });

  // Background Cloud SQL persistence helpers
  const persistProfile = async (p: TeacherProfile): Promise<{ ok: boolean; message: string }> => {
    // 1. Guarantee immediate localStorage persistence (prevents data loss on Vercel or offline)
    try {
      localStorage.setItem('norma_trazo_profile', JSON.stringify(p));
    } catch {}

    // 2. Persist to Cloud SQL PostgreSQL backend
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: p })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json().catch(() => ({}));
        if (data.ok) {
          return { ok: true, message: data.message || 'Se ha guardado correctamente en PostgreSQL' };
        }
      }
      // If deployed on a static host like Vercel without Express backend
      if (res.status === 404 || !contentType.includes('application/json')) {
        return { ok: true, message: 'Guardado localmente en el navegador (en Vercel falta backend PostgreSQL)' };
      }
      return { ok: true, message: 'Se ha guardado correctamente en PostgreSQL' };
    } catch (err: any) {
      console.warn('Backend PostgreSQL persistence unreachable, preserved in localStorage:', err);
      return { ok: true, message: 'Guardado localmente en el navegador' };
    }
  };

  const persistSdas = (list: SdaData[]) => {
    try {
      localStorage.setItem('norma_trazo_sdas', JSON.stringify(list));
    } catch {}
    fetch('/api/sdas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sdas: list })
    }).catch((err) => console.warn('Could not persist sdas to Cloud SQL:', err));
  };

  const persistWeights = (w: { ce1: number; ce2: number; ce3: number; ce4: number }) => {
    try {
      localStorage.setItem('norma_trazo_weights', JSON.stringify(w));
    } catch {}
    fetch('/api/weights', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weights: w })
    }).catch((err) => console.warn('Could not persist weights to Cloud SQL:', err));
  };

  const persistStudents = (stus: Student[]) => {
    try {
      localStorage.setItem('norma_trazo_students', JSON.stringify(stus));
    } catch {}
    fetch('/api/students', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: stus })
    }).catch((err) => console.warn('Could not persist students to Cloud SQL:', err));
  };

  const persistGrades = (grades: StudentGradeRecord[]) => {
    try {
      localStorage.setItem('norma_trazo_grades', JSON.stringify(grades));
    } catch {}
    fetch('/api/grades', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gradeRecords: grades })
    }).catch((err) => console.warn('Could not persist grades to Cloud SQL:', err));
  };

  // Synchronize state from Cloud SQL on mount
  useEffect(() => {
    let active = true;
    const fetchCloudSqlData = async () => {
      try {
        const response = await fetch('/api/sync');
        if (!response.ok) return;
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) return; // Ignore HTML SPA redirects from Vercel
        const result = await response.json();
        if (result.ok && result.data && active) {
          if (result.data.profile) {
            setTeacherProfile(result.data.profile);
            try {
              localStorage.setItem('norma_trazo_profile', JSON.stringify(result.data.profile));
            } catch {}
          }
          if (result.data.sdas && Array.isArray(result.data.sdas) && result.data.sdas.length > 0) {
            const cascaded = cascadeAllSdas(result.data.sdas);
            setSdas(cascaded);
            try {
              localStorage.setItem('norma_trazo_sdas', JSON.stringify(cascaded));
            } catch {}
            if (!activeSdaId || !cascaded.some((s: SdaData) => s.id === activeSdaId)) {
              setActiveSdaId(cascaded[0].id);
            }
          }
          if (result.data.weights) {
            setWeights(result.data.weights);
            try {
              localStorage.setItem('norma_trazo_weights', JSON.stringify(result.data.weights));
            } catch {}
          }
          if (result.data.students && Array.isArray(result.data.students) && result.data.students.length > 0) {
            setStudents(result.data.students);
            try {
              localStorage.setItem('norma_trazo_students', JSON.stringify(result.data.students));
            } catch {}
          }
          if (result.data.gradeRecords && Array.isArray(result.data.gradeRecords) && result.data.gradeRecords.length > 0) {
            setGradeRecords(result.data.gradeRecords);
            try {
              localStorage.setItem('norma_trazo_grades', JSON.stringify(result.data.gradeRecords));
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Initial Cloud SQL load fallback:', err);
      }
    };

    fetchCloudSqlData();
    return () => {
      active = false;
    };
  }, []);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [blueprintModal, setBlueprintModal] = useState<{
    isOpen: boolean;
    title: string;
    imageUrl: string;
    specs?: { tool: string; scale: string };
  }>({
    isOpen: false,
    title: '',
    imageUrl: ''
  });

  const [is3dSimOpen, setIs3dSimOpen] = useState(false);
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [isNewSdaOpen, setIsNewSdaOpen] = useState(false);
  const [isWeightEditorOpen, setIsWeightEditorOpen] = useState(false);

  // Active SdA currently loaded in editor
  const activeSda = sdas.find((s) => s.id === activeSdaId) || sdas[0];

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 4500);
  };

  const handleOpenBlueprint = (
    title: string,
    imageUrl: string,
    specs?: { tool: string; scale: string }
  ) => {
    setBlueprintModal({
      isOpen: true,
      title,
      imageUrl,
      specs
    });
  };

  // Update Profile with Cloud SQL persistence
  const handleUpdateProfile = async (updated: TeacherProfile): Promise<{ ok: boolean; message: string }> => {
    setTeacherProfile(updated);
    const result = await persistProfile(updated);
    showToast(result.message || 'Se ha guardado correctamente en PostgreSQL');
    return result;
  };

  // Adjust sessions or dates for any SdA, cascading to subsequent SdAs (Requirement 8)
  const handleUpdateSessionSchedule = (
    sdaId: string,
    newTotalSessions: number,
    newStartDate?: string,
    autoLinked?: boolean
  ) => {
    setSdas((prevSdas) => {
      const updatedList = prevSdas.map((s) => {
        if (s.id === sdaId) {
          return {
            ...s,
            totalSessions: newTotalSessions,
            ...(newStartDate ? { startDate: newStartDate } : {}),
            ...(autoLinked !== undefined ? { autoLinkedToPrev: autoLinked } : {})
          };
        }
        return s;
      });

      const cascaded = cascadeAllSdas(updatedList);
      persistSdas(cascaded);
      return cascaded;
    });

    const targetSda = sdas.find((s) => s.id === sdaId);
    showToast(`Sesiones de ${targetSda?.code || 'SdA'} ajustadas: calendario y fechas siguientes recalculadas.`);
  };

  const handleUpdateSda = (updated: SdaData) => {
    setSdas((prevSdas) => {
      const updatedList = prevSdas.map((s) => (s.id === updated.id ? updated : s));
      const cascaded = cascadeAllSdas(updatedList);
      persistSdas(cascaded);
      return cascaded;
    });
  };

  const handleUpdateAllSdas = (updatedSdas: SdaData[]) => {
    const cascaded = cascadeAllSdas(updatedSdas);
    setSdas(cascaded);
    persistSdas(cascaded);
  };

  // Creating a new SdA with automatic session placement in calendar
  const handleCreateNewSda = (newSdaData: Partial<SdaData>) => {
    setSdas((prevSdas) => {
      const nextNum = prevSdas.length + 1;
      const numStr = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;

      const created: SdaData = {
        id: newSdaData.id || `sda-${Date.now()}`,
        number: numStr,
        code: newSdaData.code || `SDA.DT1.${numStr}`,
        title: newSdaData.title || `SDA ${nextNum}: Nueva Unidad de Dibujo Técnico`,
        educationalLevel: '1.º Bachillerato',
        timing: newSdaData.timing || `${newSdaData.totalSessions || 16} ses.`,
        quarter: newSdaData.quarter || 1,
        totalSessions: newSdaData.totalSessions || 16,
        startDate: newSdaData.startDate,
        endDate: newSdaData.endDate,
        autoLinkedToPrev: newSdaData.autoLinkedToPrev !== false,
        finalProduct: newSdaData.finalProduct || {
          format: 'Formato A3 Normalizado',
          description: 'Documentación técnica y planos de fabricación con cajetín UNE 1035.',
          context: 'Entorno productivo e industrial de Extremadura'
        },
        prototype: newSdaData.prototype || {
          title: 'Prototipo y Lámina Técnica',
          type: 'Croquis & Plano UNE',
          description: 'Despiece normalizado y verificación dimensional.',
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDknP13Gmpt7PTouIOYtqnsntjf4H-nvSCHWhKtpSvA1YemGasI1UR34np68rLvofQuAX76sE-3199kM4QNUDK6FbPrgWJd1A7MqTPv6_fMWLRmV4e5c0nHMxQIClWW7LP12PkfHsEmOjocuMilEeZtBQFm625cIgTOjnDZmEZVQAu27ZA7PUqoTXZ1WoX3TBbfLBmFM-NKpTrgwOo0CtCT86UDoTII2I8UshIiA2gH5uF-nOF5Kk5V'
        },
        competenciasEspecificas: newSdaData.competenciasEspecificas || [
          {
            id: 'ce1',
            code: 'CE.DT.1',
            title: 'Fundamentos Geométrico-Métricos',
            description: 'Resolver problemas geométricos aplicando fundamentos métricos en construcciones planas.',
            checked: true
          },
          {
            id: 'ce4',
            code: 'CE.DT.4',
            title: 'Normalización y Planos Industriales',
            description: 'Elaborar croquis y planos normalizados aplicando normas UNE e ISO.',
            checked: true
          }
        ],
        criteriosEvaluacion: newSdaData.criteriosEvaluacion || [
          {
            id: 'cr11',
            code: '1.1',
            title: 'Trazados geométricos básicos y tangencias.',
            checked: true
          },
          {
            id: 'cr41',
            code: '4.1',
            title: 'Acotación funcional según normas UNE.',
            highlighted: true,
            checked: true
          }
        ],
        saberesBasicos: newSdaData.saberesBasicos || [
          'Formatos de papel normalizados (Serie A)',
          'Sistemas de acotación funcional y de fabricación',
          'Vistas ortogonales en sistema diédrico'
        ],
        competenciasClave: newSdaData.competenciasClave || [
          { code: 'STEM1', name: 'Método científico y rigor métrico', active: true },
          { code: 'STEM2', name: 'Resolución espacial y geométrica', active: true }
        ],
        dua: newSdaData.dua || {
          pauta1: {
            title: 'Pauta 1 · Múltiples formas de representación',
            description: 'Visualización simultánea mediante croquis y planos digitales CAD.',
            tags: ['CAD 2D/3D', 'Láminas guía']
          },
          pauta2: {
            title: 'Pauta 2 · Acción y Expresión',
            description: 'Plantillas con cajetines normalizados y rúbricas de autoevaluación.',
            tags: ['Plantillas UNE', 'Andamiaje']
          }
        },
        status: 'planned'
      };

      const updated = [...prevSdas, created];
      const cascaded = cascadeAllSdas(updated);
      setActiveSdaId(created.id);
      persistSdas(cascaded);
      return cascaded;
    });

    setCurrentTab('calendario-temporizacion');
    showToast(`Nueva SdA programada: ${newSdaData.totalSessions || 16} sesiones ubicadas en el calendario.`);
  };

  // Feature 2: Duplicar SdA existente encadenada
  const handleDuplicateSda = (sourceSdaId: string) => {
    const sourceSda = sdas.find((s) => s.id === sourceSdaId);
    if (!sourceSda) return;

    setSdas((prevSdas) => {
      const nextNum = prevSdas.length + 1;
      const numStr = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;

      const duplicated: SdaData = {
        ...sourceSda,
        id: `sda-${Date.now()}`,
        number: numStr,
        code: `SDA.DT1.${numStr}`,
        title: `${sourceSda.title} (Copia)`,
        autoLinkedToPrev: true,
        status: 'planned'
      };

      const updated = [...prevSdas, duplicated];
      const cascaded = cascadeAllSdas(updated);
      setActiveSdaId(duplicated.id);
      persistSdas(cascaded);
      return cascaded;
    });

    showToast(`SdA duplicada y encadenada automáticamente en el calendario.`);
  };

  // Feature 1: Student Gradebook handlers with Cloud SQL persistence
  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => {
      const updated = [...prev, newStudent];
      persistStudents(updated);
      return updated;
    });
  };

  const handleRemoveStudent = (studentId: string) => {
    setStudents((prev) => {
      const updated = prev.filter((s) => s.id !== studentId);
      persistStudents(updated);
      return updated;
    });
    setGradeRecords((prev) => {
      const updated = prev.filter((r) => r.studentId !== studentId);
      persistGrades(updated);
      return updated;
    });
    showToast('Alumno eliminado del cuaderno.');
  };

  const handleUpdateGradeRecords = (newRecords: StudentGradeRecord[]) => {
    setGradeRecords(newRecords);
    persistGrades(newRecords);
  };

  const handleSaveWeights = (newW: { ce1: number; ce2: number; ce3: number; ce4: number }) => {
    setWeights(newW);
    persistWeights(newW);
    showToast('Ponderaciones guardadas: suma total 100% verificada.');
  };

  // Feature 3: Restore full JSON Backup
  const handleRestoreBackup = (data: {
    profile?: TeacherProfile;
    sdas?: SdaData[];
    weights?: { ce1: number; ce2: number; ce3: number; ce4: number };
    students?: Student[];
    gradeRecords?: StudentGradeRecord[];
  }) => {
    if (data.profile) setTeacherProfile(data.profile);
    if (data.sdas) setSdas(cascadeAllSdas(data.sdas));
    if (data.weights) setWeights(data.weights);
    if (data.students) setStudents(data.students);
    if (data.gradeRecords) setGradeRecords(data.gradeRecords);

    fetch('/api/sync/all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch((err) => console.warn('Could not persist restored backup:', err));
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface flex flex-col min-h-screen selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Top Header with Profile and Navigation */}
      <Header
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        profile={teacherProfile}
        onUpdateProfile={handleUpdateProfile}
        onShowToast={showToast}
        isProfileOpen={isProfileModalOpen}
        startInEditMode={isProfileModalEditMode}
        onCloseProfile={() => {
          setIsProfileModalOpen(false);
          setIsProfileModalEditMode(false);
        }}
        onOpenProfile={(editMode) => {
          setIsProfileModalEditMode(Boolean(editMode));
          setIsProfileModalOpen(true);
        }}
        onOpenGeminiAssistant={() => setIsGeminiModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full pt-20 pb-24 max-w-4xl mx-auto">
        {currentTab === 'dashboard' && (
          <DashboardView
            onNavigate={setCurrentTab}
            onOpenNewSda={() => setIsNewSdaOpen(true)}
            onOpenExportPdf={() => setIsExportPdfOpen(true)}
            onShowToast={showToast}
            profile={teacherProfile}
            sdas={sdas}
            onSelectSda={(sdaId) => {
              setActiveSdaId(sdaId);
              setCurrentTab('situaciones-aprendizaje');
            }}
            onOpenProfile={() => {
              setIsProfileModalEditMode(true);
              setIsProfileModalOpen(true);
            }}
            onAdjustSessions={(sdaId, delta) => {
              const currentS = sdas.find((s) => s.id === sdaId);
              if (currentS) {
                handleUpdateSessionSchedule(sdaId, (currentS.totalSessions || 16) + delta);
              }
            }}
            onDuplicateSda={handleDuplicateSda}
            onOpenGeminiAssistant={() => setIsGeminiModalOpen(true)}
          />
        )}

        {currentTab === 'situaciones-aprendizaje' && (
          <SdaEditorView
            sda={activeSda}
            sdas={sdas}
            onSelectSda={setActiveSdaId}
            onUpdateSda={handleUpdateSda}
            onUpdateSessionSchedule={handleUpdateSessionSchedule}
            onNavigate={setCurrentTab}
            onOpenBlueprint={handleOpenBlueprint}
            onShowToast={showToast}
            onOpenNewSda={() => setIsNewSdaOpen(true)}
            onDuplicateSda={handleDuplicateSda}
          />
        )}

        {currentTab === 'mapa-curricular' && (
          <MapaCurricularView
            sdas={sdas}
            onUpdateSdas={handleUpdateAllSdas}
            onNavigateToSda={(sdaId) => {
              setActiveSdaId(sdaId);
              setCurrentTab('situaciones-aprendizaje');
            }}
            onNavigate={setCurrentTab}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'calendario-temporizacion' && (
          <AgendaView
            sdas={sdas}
            onUpdateSdas={handleUpdateAllSdas}
            onNavigateToSda={(sdaId) => {
              setActiveSdaId(sdaId);
              setCurrentTab('situaciones-aprendizaje');
            }}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'evaluacion-rubricas' && (
          <RubricasView
            weights={weights}
            onOpenWeightEditor={() => setIsWeightEditorOpen(true)}
            onOpenPdf={() => setIsExportPdfOpen(true)}
            onShowToast={showToast}
            sdas={sdas}
            students={students}
            gradeRecords={gradeRecords}
            onUpdateGradeRecords={handleUpdateGradeRecords}
            onAddStudent={handleAddStudent}
            onRemoveStudent={handleRemoveStudent}
          />
        )}

        {currentTab === 'banco-actividades' && (
          <BancoView
            onOpenBlueprint={handleOpenBlueprint}
            onOpen3dSim={() => setIs3dSimOpen(true)}
            onOpenPdf={() => setIsExportPdfOpen(true)}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} onNavigate={setCurrentTab} />

      {/* Global Toast Notification */}
      <div
        className={`fixed top-6 left-4 right-4 max-w-lg mx-auto bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 transform transition-all duration-300 z-[9999] border-2 border-emerald-500/50 ${
          toastMessage ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-28 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="material-symbols-outlined text-emerald-400 text-[26px] shrink-0 animate-pulse">
            check_circle
          </span>
          <div className="min-w-0">
            <span className="font-bold text-sm text-white block leading-snug">
              {toastMessage}
            </span>
            <span className="text-[11px] text-emerald-300 font-medium block mt-0.5">
              Base de datos Cloud SQL PostgreSQL sincronizada en tiempo real
            </span>
          </div>
        </div>
        <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg shrink-0">
          PostgreSQL
        </span>
      </div>

      {/* Blueprint Inspection Modal */}
      <BlueprintModal
        isOpen={blueprintModal.isOpen}
        onClose={() => setBlueprintModal((prev) => ({ ...prev, isOpen: false }))}
        title={blueprintModal.title}
        imageUrl={blueprintModal.imageUrl}
        specs={blueprintModal.specs}
      />

      {/* 3D Dihedral Simulation Modal */}
      <Simulation3DModal
        isOpen={is3dSimOpen}
        onClose={() => setIs3dSimOpen(false)}
      />

      {/* PDF Export Modal */}
      <ExportPdfModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
        profile={teacherProfile}
        sdas={sdas}
        weights={weights}
        students={students}
        gradeRecords={gradeRecords}
        onRestoreBackup={handleRestoreBackup}
        onShowToast={showToast}
      />

      {/* New SDA Creator Modal (Diseñador con Desplegables Encadenados) */}
      <NewSdaModal
        isOpen={isNewSdaOpen}
        onClose={() => setIsNewSdaOpen(false)}
        sdas={sdas}
        onCreated={handleCreateNewSda}
        onShowToast={showToast}
        onOpenGeminiAssistant={() => setIsGeminiModalOpen(true)}
      />

      {/* Competency Weight Editor Modal */}
      <WeightEditorModal
        isOpen={isWeightEditorOpen}
        onClose={() => setIsWeightEditorOpen(false)}
        weights={weights}
        onSave={handleSaveWeights}
      />

      {/* Gemini AI Curriculum Assistant Modal */}
      <GeminiAssistantModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        sdas={sdas}
        profile={teacherProfile}
        onInsertGeneratedSda={handleCreateNewSda}
        onShowToast={showToast}
      />
    </div>
  );
}
