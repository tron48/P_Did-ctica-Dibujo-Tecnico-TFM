import React, { useState } from 'react';
import { ACTIVITY_RESOURCES } from '../data/curriculumData';
import { ActivityResource } from '../types';

interface BancoViewProps {
  onOpenBlueprint: (title: string, imageUrl: string, specs?: { tool: string; scale: string }) => void;
  onOpen3dSim: () => void;
  onOpenPdf: () => void;
  onShowToast: (message: string) => void;
}

export const BancoView: React.FC<BancoViewProps> = ({
  onOpenBlueprint,
  onOpen3dSim,
  onOpenPdf,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [importedIds, setImportedIds] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDwgModal, setShowDwgModal] = useState(false);

  // New resource form state
  const [newTitle, setNewTitle] = useState('');
  const [newBlock, setNewBlock] = useState('b1');
  const [newFormat, setNewFormat] = useState('A3 DIN');

  const filteredActivities = ACTIVITY_RESOURCES.filter((act) => {
    const matchesCategory =
      activeCategory === 'all' ||
      (activeCategory === 'format' && (act.format === 'A3 DIN' || act.format === 'A4 DIN')) ||
      act.category === activeCategory;

    const matchesSearch =
      searchQuery === '' ||
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.criteria.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleImport = (id: string, title: string) => {
    if (!importedIds.includes(id)) {
      setImportedIds((prev) => [...prev, id]);
      onShowToast(`"${title.slice(0, 36)}..." vinculada a tu SDA activa.`);
    } else {
      onShowToast('Esta lámina ya se encuentra asignada a tu programación.');
    }
  };

  const handleBookmark = (id: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds((prev) => prev.filter((item) => item !== id));
      onShowToast('Lámina eliminada de favoritos.');
    } else {
      setBookmarkedIds((prev) => [...prev, id]);
      onShowToast('Lámina guardada en favoritos.');
    }
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    onShowToast(`Lámina técnica "${newTitle}" añadida al repositorio local.`);
    setShowCreateModal(false);
    setNewTitle('');
  };

  return (
    <div className="flex flex-col w-full relative">
      {/* Interactive Blueprint Header Banner */}
      <div className="px-margin-mobile pt-space-md pb-space-sm">
        <div className="bg-primary-container text-on-primary rounded-xl p-space-md shadow-md relative overflow-hidden">
          {/* Decorative Draft Linework Background */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 opacity-15 pointer-events-none">
            <svg className="w-full h-full text-secondary-container stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" strokeDasharray="3 3"></circle>
              <path d="M50 8 L50 92 M8 50 L92 50"></path>
              <polygon points="50,18 78,72 22,72" strokeWidth="1"></polygon>
            </svg>
          </div>
          <div className="relative z-10 flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-badge text-label-badge text-secondary-fixed uppercase tracking-wider bg-surface-container-lowest/10 px-2 py-0.5 rounded font-semibold">
                Catálogo Didáctico LOMLOE
              </span>
              <span className="font-label-code text-label-code text-on-primary-container flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-tertiary-fixed inline-block"></span>
                28 Recursos Listos
              </span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-primary tracking-tight font-bold">
              Banco de Láminas y Retos
            </h1>
            <p className="font-body-sm text-body-sm text-surface-container-highest max-w-[90%]">
              Actividades vectoriales, piezas de examen y rúbricas ajustadas al currículo de Extremadura (Decreto 110/2022).
            </p>
          </div>
        </div>
      </div>

      {/* Search & Fast Filter Bar */}
      <div className="px-margin-mobile py-space-xs flex flex-col gap-space-sm sticky top-20 z-30 bg-surface/95 backdrop-blur-md pb-space-sm">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por criterio, escala, tangencia, diédrico..."
            className="w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 placeholder:text-outline border border-surface-container"
          />
          <button
            onClick={() => onShowToast('Filtros avanzados activos: Curso 1.º Bachillerato')}
            className="absolute right-2.5 p-1 rounded hover:bg-surface-container text-on-surface-variant"
            title="Filtros avanzados"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </button>
        </div>

        {/* Category Pills / Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5" id="filter-pills">
          <button
            onClick={() => setActiveCategory('all')}
            className={`filter-pill shrink-0 px-3 py-1.5 rounded-full font-label-badge text-label-badge transition-all ${
              activeCategory === 'all'
                ? 'bg-primary text-on-primary font-semibold shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-medium'
            }`}
          >
            Todas (28)
          </button>
          <button
            onClick={() => setActiveCategory('format')}
            className={`filter-pill shrink-0 px-3 py-1.5 rounded-full font-label-badge text-label-badge transition-all ${
              activeCategory === 'format'
                ? 'bg-primary text-on-primary font-semibold shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-medium'
            }`}
          >
            Láminas A3/A4
          </button>
          <button
            onClick={() => setActiveCategory('b1')}
            className={`filter-pill shrink-0 px-3 py-1.5 rounded-full font-label-badge text-label-badge transition-all ${
              activeCategory === 'b1'
                ? 'bg-primary text-on-primary font-semibold shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-medium'
            }`}
          >
            Geometría Métrica
          </button>
          <button
            onClick={() => setActiveCategory('b2')}
            className={`filter-pill shrink-0 px-3 py-1.5 rounded-full font-label-badge text-label-badge transition-all ${
              activeCategory === 'b2'
                ? 'bg-primary text-on-primary font-semibold shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-medium'
            }`}
          >
            Sistema Diédrico
          </button>
          <button
            onClick={() => setActiveCategory('b2-ax')}
            className={`filter-pill shrink-0 px-3 py-1.5 rounded-full font-label-badge text-label-badge transition-all ${
              activeCategory === 'b2-ax'
                ? 'bg-primary text-on-primary font-semibold shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-medium'
            }`}
          >
            Axonometría
          </button>
          <button
            onClick={() => setActiveCategory('b3')}
            className={`filter-pill shrink-0 px-3 py-1.5 rounded-full font-label-badge text-label-badge transition-all ${
              activeCategory === 'b3'
                ? 'bg-primary text-on-primary font-semibold shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-medium'
            }`}
          >
            Normalización UNE
          </button>
        </div>
      </div>

      {/* Micro Technical Metric Bar */}
      <div className="px-margin-mobile py-1 flex items-center justify-between text-on-surface-variant font-label-code text-label-code">
        <span className="flex items-center gap-1 font-semibold">
          <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
          Curadas por Asesoría Técnica
        </span>
        <button 
          onClick={() => onShowToast('Ordenación actualizada: Recientes')}
          className="text-secondary font-semibold cursor-pointer flex items-center gap-0.5"
        >
          <span>Ordenar: Recientes</span>
          <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
        </button>
      </div>

      {/* Activities Showcase List */}
      <div className="px-margin-mobile flex flex-col gap-space-md py-space-sm">
        {filteredActivities.map((act) => {
          const isImported = importedIds.includes(act.id);
          const isBookmarked = bookmarkedIds.includes(act.id);

          return (
            <article
              key={act.id}
              className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col relative transition-all duration-200 hover:shadow-md border border-surface-container/60"
            >
              {/* Technical Color Accent Edge */}
              <div
                className={`h-1 w-full ${
                  act.category === 'b1'
                    ? 'bg-secondary'
                    : act.category === 'b2'
                    ? 'bg-secondary-container'
                    : act.category === 'b2-ax'
                    ? 'bg-on-tertiary-container'
                    : 'bg-primary'
                }`}
              ></div>

              <div className="p-space-md flex flex-col gap-space-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-label-badge text-label-badge uppercase bg-surface-container px-2 py-0.5 rounded text-secondary font-semibold">
                      {act.block}
                    </span>
                    <span className={`font-label-badge text-label-badge px-2 py-0.5 rounded font-semibold ${act.difficultyClass}`}>
                      {act.difficulty}
                    </span>
                    <span className="font-label-code text-label-code text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> {act.sessions} sesiones
                    </span>
                  </div>
                  <button
                    onClick={() => handleBookmark(act.id)}
                    className={`p-1 transition-colors ${
                      isBookmarked ? 'text-amber-500' : 'text-on-surface-variant hover:text-secondary'
                    }`}
                    title="Guardar en favoritos"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isBookmarked ? 'bookmark' : 'bookmark_add'}
                    </span>
                  </button>
                </div>

                <div className="flex gap-space-sm items-start">
                  <div
                    onClick={() => onOpenBlueprint(act.title, act.imageUrl, act.specs)}
                    className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container flex items-center justify-center relative shadow-inner cursor-pointer group"
                  >
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      src={act.imageUrl}
                      alt={act.title}
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-1 right-1 bg-primary/80 text-on-primary font-label-badge text-[9px] px-1 rounded font-mono font-bold">
                      {act.format}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h2
                      onClick={() => onOpenBlueprint(act.title, act.imageUrl, act.specs)}
                      className="font-title-md text-title-md text-on-surface font-bold leading-snug line-clamp-2 cursor-pointer hover:text-secondary transition-colors"
                    >
                      {act.title}
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-1">
                      {act.description}
                    </p>
                  </div>
                </div>

                {/* Curricular Badge Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {act.criteria.map((crit, idx) => (
                    <span
                      key={idx}
                      className="font-label-badge text-label-badge px-2 py-0.5 rounded bg-surface-container-high text-on-secondary-container font-mono"
                    >
                      {crit}
                    </span>
                  ))}
                  {act.isVectorial && (
                    <span className="font-label-badge text-label-badge px-2 py-0.5 rounded bg-tertiary-container/10 text-on-tertiary-container font-mono font-semibold">
                      ✓ Solución Vectorial .SVG
                    </span>
                  )}
                  {act.has3dSim && (
                    <span className="font-label-badge text-label-badge px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-mono flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[13px]">view_in_ar</span> Simulador 3D Activo
                    </span>
                  )}
                  {act.hasRubric && (
                    <span className="font-label-badge text-label-badge px-2 py-0.5 rounded bg-tertiary-fixed/30 text-on-tertiary-fixed-variant font-mono font-semibold">
                      ★ Incluye Rúbrica 4 Niveles
                    </span>
                  )}
                </div>

                {/* Specs Strip */}
                <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between text-on-surface font-label-code text-label-code">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      {act.category === 'b1' ? 'architecture' : act.category === 'b2' ? 'straighten' : act.category === 'b2-ax' ? 'grid_goldenratio' : 'edit'}
                    </span>
                    {act.specs.tool}
                  </span>
                  <span className="text-on-surface-variant font-medium">{act.specs.scale}</span>
                </div>

                {/* Action Ribbon */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {act.has3dSim ? (
                    <button
                      onClick={onOpen3dSim}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-surface-container hover:bg-secondary-fixed hover:text-on-secondary-fixed text-on-surface font-title-sm text-[12px] font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] text-secondary">play_circle</span>
                      <span>Ver 3D</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenBlueprint(act.title, act.imageUrl, act.specs)}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-title-sm text-[12px] font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>Lámina</span>
                    </button>
                  )}

                  <button
                    onClick={onOpenPdf}
                    className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-title-sm text-[12px] font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>{act.category === 'b3' ? 'Enunciado' : 'PDF'}</span>
                  </button>

                  <button
                    onClick={() => handleImport(act.id, act.title)}
                    className={`flex items-center justify-center gap-1 py-2 px-2 rounded-lg font-title-sm text-[12px] font-semibold shadow-sm transition-all ${
                      isImported
                        ? 'bg-tertiary-container text-on-tertiary'
                        : 'bg-primary text-on-primary hover:bg-secondary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isImported ? 'done' : 'add_circle'}
                    </span>
                    <span>{isImported ? 'Vinculada' : 'A mi SDA'}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pedagogical Resource Drawer Tip */}
      <div className="px-margin-mobile pt-space-xs pb-space-xl">
        <div 
          onClick={() => setShowDwgModal(true)}
          className="bg-surface-container p-space-md rounded-xl flex items-center gap-space-sm text-on-surface shadow-sm cursor-pointer hover:bg-surface-container-high transition-colors border border-surface-container-highest"
        >
          <div className="p-2 rounded-lg bg-secondary text-on-secondary shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">folder_special</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-title-sm text-title-sm font-bold text-on-surface">
              ¿Necesitas plantillas en formato vectorial DWG/DXF?
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Accede al repositorio homologado de cajetines oficiales UNE 1035 para centros IES de Extremadura.
            </span>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) for Teacher */}
      <div className="fixed right-4 bottom-20 z-30">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-3 rounded-full shadow-lg hover:bg-secondary transition-all transform active:scale-95 group focus:outline-none"
          id="btn-create-activity"
        >
          <span className="material-symbols-outlined text-[22px] group-hover:rotate-90 transition-transform">
            add
          </span>
          <span className="font-title-sm text-title-sm font-semibold pr-1">Subir Lámina / Crear</span>
        </button>
      </div>

      {/* Create Sheet Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/70 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-5 shadow-2xl border border-surface-container animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <h3 className="font-title-md font-bold text-on-surface">Subir Lámina al Catálogo</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateResource} className="py-4 space-y-3 text-xs font-body-sm">
              <div>
                <label className="font-semibold block mb-1">Título de la Lámina *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Trazado de Parábola por Tangentes en Puente de Alcántara"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-secondary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Bloque Curricular</label>
                  <select
                    value={newBlock}
                    onChange={(e) => setNewBlock(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-secondary"
                  >
                    <option value="b1">Bloque 1: Métrica</option>
                    <option value="b2">Bloque 2: Diédrico</option>
                    <option value="b2-ax">Bloque 2: Axonometría</option>
                    <option value="b3">Bloque 3: Normalización</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Formato Papel</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-secondary"
                  >
                    <option value="A3 DIN">A3 DIN (420x297)</option>
                    <option value="A4 DIN">A4 DIN (297x210)</option>
                    <option value="Croquis">Croquis / Cuaderno</option>
                  </select>
                </div>
              </div>
              <div className="p-3 bg-surface-container rounded-xl text-on-surface-variant">
                Se archivará con el código UNE 1034 oficial de Extremadura.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-secondary transition-colors"
                >
                  Guardar en Repositorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DWG / DXF Templates Modal */}
      {showDwgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/70 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">folder_zip</span>
                <h3 className="font-title-md font-bold text-on-surface">Cajetines UNE 1035 para CAD</h3>
              </div>
              <button 
                onClick={() => setShowDwgModal(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs font-body-sm">
              <p className="text-on-surface-variant">
                Descarga los bloques normalizados oficiales para LibreCAD, FreeCAD, AutoCAD y QCad configurados con capas de trazo UNE-EN ISO 128 (aristas gruesas 0.8mm, finas 0.2mm, ejes y cotas).
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-on-surface">Plantilla_A3_Extremadura.dxf</span>
                    <p className="text-[11px] text-on-surface-variant">Cajetín escolar 170x36mm con campos Rayuela</p>
                  </div>
                  <button 
                    onClick={() => {
                      onShowToast('Descargando Plantilla_A3_Extremadura.dxf...');
                      setShowDwgModal(false);
                    }}
                    className="p-2 bg-secondary text-on-secondary rounded-lg hover:bg-secondary/90"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                  </button>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-on-surface">Plantilla_A4_Extremadura.dwg</span>
                    <p className="text-[11px] text-on-surface-variant">Orientación vertical y horizontal con márgenes de archivo</p>
                  </div>
                  <button 
                    onClick={() => {
                      onShowToast('Descargando Plantilla_A4_Extremadura.dwg...');
                      setShowDwgModal(false);
                    }}
                    className="p-2 bg-secondary text-on-secondary rounded-lg hover:bg-secondary/90"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDwgModal(false)}
              className="w-full py-2 bg-surface-container text-on-surface rounded-xl text-xs font-semibold hover:bg-surface-container-high transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
