import React, { useState } from 'react';
import { NavTab, TeacherProfile } from '../types';

interface HeaderProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  profile: TeacherProfile;
  onUpdateProfile: (updated: TeacherProfile) => Promise<{ ok: boolean; message: string }>;
  onShowToast: (message: string) => void;
  isProfileOpen?: boolean;
  startInEditMode?: boolean;
  onCloseProfile?: () => void;
  onOpenProfile?: (startInEditMode?: boolean) => void;
  onOpenGeminiAssistant?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  profile,
  onUpdateProfile,
  onShowToast,
  isProfileOpen,
  startInEditMode,
  onCloseProfile,
  onOpenProfile,
  onOpenGeminiAssistant
}) => {
  const [internalShowProfile, setInternalShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const showProfile = isProfileOpen !== undefined ? isProfileOpen : internalShowProfile;

  // Edit form state
  const [formData, setFormData] = useState<TeacherProfile>(profile);

  // Sync formData when profile changes
  React.useEffect(() => {
    setFormData(profile);
  }, [profile]);

  // If opened with explicit edit request, start in edit mode
  React.useEffect(() => {
    if (showProfile && startInEditMode) {
      setIsEditing(true);
      setFormData(profile);
      setSaveSuccessMsg(null);
    }
  }, [showProfile, startInEditMode, profile]);

  const handleOpenModal = () => {
    setFormData(profile);
    setIsEditing(false);
    setSaveSuccessMsg(null);
    if (onOpenProfile) {
      onOpenProfile(false);
    } else {
      setInternalShowProfile(true);
    }
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setSaveSuccessMsg(null);
    if (onCloseProfile) {
      onCloseProfile();
    } else {
      setInternalShowProfile(false);
    }
  };

  const handleStartEdit = () => {
    setFormData(profile);
    setIsEditing(true);
    setSaveSuccessMsg(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      const result = await onUpdateProfile(formData);
      setIsEditing(false);
      const msg = result?.message || 'Se ha guardado correctamente en PostgreSQL';
      setSaveSuccessMsg(msg);
      onShowToast(msg);
      setTimeout(() => setSaveSuccessMsg(null), 8000);
    } catch (err: any) {
      console.error('Error saving profile to PostgreSQL:', err);
      const errorMsg = 'Error al guardar en PostgreSQL: ' + (err?.message || 'Fallo de conexión');
      onShowToast(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-40 bg-primary-container/95 backdrop-blur-xl text-on-primary shadow-[0_1px_8px_rgba(0,0,0,0.08)] border-b border-primary/20">
        <div className="max-w-7xl mx-auto h-20 px-4 flex items-center justify-between gap-3 pt-safe">
          {/* Logo & Subject Brand */}
          <div 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center gap-3 min-w-0 cursor-pointer group"
          >
            <img 
              alt="Norma & Trazo Logo" 
              className="h-8 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform" 
              src="https://lh3.googleusercontent.com/aida/AEtjO1WQITGUVmx0hToMtKK1UCJ01qQVb742l1De_eeNzdoaw0JQ_ULuSu14VoiffrJLQ1wtx8o3zFpTCzqZxNCaZNzYw9NVgt6AVF4PccJjJEDPg9qI_WxnARVtk7rTTLk5-umYEXRfPV5_9O9bv3f8qKPKnMphJoXKbIlNCYUTGFVXopj8XF8cOiQJocHvw8KIVJxK2Rzi47d4aaXX21X7E8qbozvyZogWUr20jeg57CFeUAaiD3fHgWoxnQ"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-title-sm text-title-sm text-on-primary truncate font-bold tracking-tight">
                  Norma &amp; Trazo
                </span>
                <span className="text-[10px] uppercase tracking-wider bg-white/15 text-sky-200 px-2 py-0.5 rounded-md font-semibold border border-white/20">
                  Extremadura · D. 110/2022
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-primary-container truncate">
                {profile.subject} · {profile.center.split('·')[0].trim()}
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-surface-container-lowest/10 p-1 rounded-xl">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-secondary text-on-secondary font-semibold shadow-xs'
                  : 'text-on-primary-container hover:text-on-primary hover:bg-surface-container-lowest/5'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => onNavigate('situaciones-aprendizaje')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'situaciones-aprendizaje'
                  ? 'bg-secondary text-on-secondary font-semibold shadow-xs'
                  : 'text-on-primary-container hover:text-on-primary hover:bg-surface-container-lowest/5'
              }`}
            >
              S.A. LOMLOE
            </button>
            <button
              onClick={() => onNavigate('mapa-curricular')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                currentTab === 'mapa-curricular'
                  ? 'bg-secondary text-on-secondary font-semibold shadow-xs'
                  : 'text-on-primary-container hover:text-on-primary hover:bg-surface-container-lowest/5'
              }`}
            >
              <span>Mapa Curricular</span>
            </button>
            <button
              onClick={() => onNavigate('calendario-temporizacion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'calendario-temporizacion'
                  ? 'bg-secondary text-on-secondary font-semibold shadow-xs'
                  : 'text-on-primary-container hover:text-on-primary hover:bg-surface-container-lowest/5'
              }`}
            >
              Agenda
            </button>
            <button
              onClick={() => onNavigate('evaluacion-rubricas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'evaluacion-rubricas'
                  ? 'bg-secondary text-on-secondary font-semibold shadow-xs'
                  : 'text-on-primary-container hover:text-on-primary hover:bg-surface-container-lowest/5'
              }`}
            >
              Rúbricas
            </button>
            <button
              onClick={() => onNavigate('banco-actividades')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'banco-actividades'
                  ? 'bg-secondary text-on-secondary font-semibold shadow-xs'
                  : 'text-on-primary-container hover:text-on-primary hover:bg-surface-container-lowest/5'
              }`}
            >
              Banco de Láminas
            </button>
          </nav>

          {/* Teacher Profile & Fast Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenGeminiAssistant && (
              <button
                type="button"
                onClick={onOpenGeminiAssistant}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-400 via-indigo-400 to-primary text-slate-950 font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-white/30"
                title="Abrir Asistente Curricular con IA Gemini (@google/genai)"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-950 animate-pulse">auto_awesome</span>
                <span className="font-extrabold tracking-wide">Gemini IA</span>
              </button>
            )}

            <button 
              onClick={handleOpenModal}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-container-lowest/10 transition-colors focus:outline-none"
              title={`Perfil: ${profile.name} (${profile.center})`}
            >
              <img 
                alt={profile.name} 
                className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-secondary-container/50 shadow-sm" 
                src={profile.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuANya4rUoouoQ8zzVxEEA9OQ0zK6JxYoiHhtHb9ypu58KzWH4RTsYBmt23Co9rx0oXCn0jdT3aabCkCZ2VkXeWGe5H9-9Z1-ZChzlANvcwfChH-kqjY1cHc7DXoIhd5cZIixPyb8kp2JFhC9eJS45rF1dINrsDG-O034GdpdAG7zw6LaxtsZDVh2ZTzM7cmtsTlMo7jtX6O3LFhv25l-rRvsZaaPwUUCGOiyn9vwJLwTv1903gUFTm9"}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Teacher Profile & Center Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-primary-container text-on-primary p-5 relative border-b border-primary/20 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <img 
                    alt={profile.name} 
                    className="w-13 h-13 md:w-14 md:h-14 rounded-full object-cover ring-2 ring-secondary-container shrink-0"
                    src={profile.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuANya4rUoouoQ8zzVxEEA9OQ0zK6JxYoiHhtHb9ypu58KzWH4RTsYBmt23Co9rx0oXCn0jdT3aabCkCZ2VkXeWGe5H9-9Z1-ZChzlANvcwfChH-kqjY1cHc7DXoIhd5cZIixPyb8kp2JFhC9eJS45rF1dINrsDG-O034GdpdAG7zw6LaxtsZDVh2ZTzM7cmtsTlMo7jtX6O3LFhv25l-rRvsZaaPwUUCGOiyn9vwJLwTv1903gUFTm9"}
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-base md:text-lg text-white leading-tight truncate">
                      {isEditing ? formData.name || 'Editar Nombre' : profile.name}
                    </h3>
                    <p className="text-xs text-on-primary-container truncate mt-0.5">
                      {isEditing ? formData.role || 'Editar Cargo' : profile.role}
                    </p>
                    <span className="text-[11px] font-semibold bg-secondary text-white px-2.5 py-0.5 rounded-full mt-1.5 inline-block truncate max-w-full">
                      {isEditing ? formData.center || 'Editar Centro' : profile.center}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="Editar datos del perfil, centro y asignatura"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                  )}
                  <button 
                    onClick={handleCloseModal}
                    className="text-on-primary-container hover:text-white p-1.5 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto">
              {/* Success Notification Banner inside modal */}
              {saveSuccessMsg && (
                <div className="mb-4 bg-emerald-50 border-2 border-emerald-500 text-emerald-950 rounded-xl p-4 flex items-center gap-3.5 text-xs font-semibold shadow-xs animate-in fade-in duration-200">
                  <span className="material-symbols-outlined text-emerald-600 text-[26px] shrink-0">check_circle</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-sm text-emerald-900 leading-tight">{saveSuccessMsg}</p>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-600 text-white tracking-wider">PostgreSQL</span>
                    </div>
                    <p className="text-[11px] font-medium text-emerald-700 mt-0.5">Tus datos se han persistido con éxito en la base de datos PostgreSQL de Cloud SQL.</p>
                  </div>
                </div>
              )}

              {isEditing ? (
                /* Edit Form */
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-3.5 text-xs">
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-center gap-2 text-sky-950 font-medium">
                    <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">info</span>
                    <span>Modifica los datos del centro educativo, asignatura o docente. Se actualizarán en la programación y documentos oficiales.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700">Nombre del Profesor/a:</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="p-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700">Cargo / Especialidad:</label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="Ej. Catedrático de Dibujo Técnico"
                        required
                        className="p-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">Centro Educativo y Localidad:</label>
                    <input
                      type="text"
                      value={formData.center}
                      onChange={(e) => setFormData({ ...formData, center: e.target.value })}
                      placeholder="Ej. IES Santa Eulalia · Mérida"
                      required
                      className="p-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700">Departamento Didáctico:</label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Ej. Artes Plásticas y Visuales"
                        required
                        className="p-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700">Asignatura y Curso:</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Ej. Dibujo Técnico I (1.º Bach.)"
                        required
                        className="p-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700">Curso Académico:</label>
                      <input
                        type="text"
                        value={formData.academicYear}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                        placeholder="2027–2028"
                        required
                        className="p-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700">Horas Lectivas Planificadas:</label>
                      <input
                        type="text"
                        value={formData.hours}
                        onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                        placeholder="4 h/semana · 140 h anuales"
                        required
                        className="p-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">Marco Normativo Vigente:</label>
                    <input
                      type="text"
                      value={formData.framework}
                      onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
                      placeholder="Decreto 110/2022 LOMLOE Extremadura"
                      required
                      className="p-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-medium"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 mt-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-slate-900 text-white font-semibold flex items-center gap-2 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">{isSaving ? 'sync' : 'cloud_done'}</span>
                      <span>{isSaving ? 'Guardando en PostgreSQL...' : 'Guardar Cambios en PostgreSQL'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* View Mode */
                <div className="flex flex-col gap-3 font-body-sm text-xs md:text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Departamento:</span>
                    <span className="font-bold text-slate-900">{profile.department}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Asignatura:</span>
                    <span className="font-bold text-slate-900">{profile.subject}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Centro Educativo:</span>
                    <span className="font-bold text-slate-900">{profile.center}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Marco normativo:</span>
                    <span className="text-secondary font-semibold">{profile.framework}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Curso Académico:</span>
                    <span className="font-bold text-slate-900 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                      {profile.academicYear}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Horas lectivas planificadas:</span>
                    <span className="font-semibold text-slate-900">{profile.hours}</span>
                  </div>

                  <div className="pt-3 flex flex-col gap-2">
                    <button 
                      type="button"
                      onClick={handleStartEdit}
                      className="w-full py-2.5 bg-sky-50 hover:bg-sky-100 text-secondary border border-sky-200 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      <span>Modificar Datos del Centro, Asignatura o Profesor</span>
                    </button>

                    <button 
                      onClick={() => {
                        handleCloseModal();
                        onNavigate('situaciones-aprendizaje');
                      }}
                      className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-xs shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit_document</span>
                      <span>Diseñar Programación Didáctica 2027–2028</span>
                    </button>

                    <button 
                      onClick={handleCloseModal}
                      className="w-full py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-xs font-semibold transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
