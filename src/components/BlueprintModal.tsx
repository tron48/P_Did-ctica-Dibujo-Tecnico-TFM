import React, { useState } from 'react';

interface BlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageUrl: string;
  format?: string;
  description?: string;
  specs?: {
    tool: string;
    scale: string;
  };
}

export const BlueprintModal: React.FC<BlueprintModalProps> = ({
  isOpen,
  onClose,
  title,
  imageUrl,
  format = 'Formato A3 Normalizado (UNE 1034)',
  description = 'Vistas ortogonales normalizadas, corte por plano secante y acotación funcional completa con cajetín oficial.',
  specs = { tool: 'Tinta calibrada 0.2 / 0.8 mm', scale: '1:1' }
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-primary/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest text-on-surface rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-surface-container">
        {/* Modal Header */}
        <div className="bg-primary-container text-on-primary px-5 py-3.5 flex items-center justify-between gap-3 border-b border-primary/20">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-secondary-container text-[22px]">architecture</span>
            <div className="min-w-0">
              <h3 className="font-title-md font-bold text-on-primary truncate">{title}</h3>
              <p className="font-label-code text-[11px] text-on-primary-container">{format} · Escala {specs.scale}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
              className="p-1.5 rounded-lg bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary transition-colors"
              title="Reducir zoom"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_out</span>
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
              className="p-1.5 rounded-lg bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary transition-colors"
              title="Aumentar zoom"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_in</span>
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-lg transition-colors ${showGrid ? 'bg-secondary text-on-secondary' : 'bg-surface-container-lowest/10 text-on-primary'}`}
              title="Alternar retícula milimetrada"
            >
              <span className="material-symbols-outlined text-[18px]">grid_4x4</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-container-lowest/20 text-on-primary transition-colors ml-2"
              title="Cerrar"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Blueprint Canvas Viewport */}
        <div className="relative flex-1 overflow-auto bg-surface-container-low p-4 min-h-[320px] max-h-[550px] flex items-center justify-center">
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'radial-gradient(#006398 0.75px, transparent 0.75px), radial-gradient(#006398 0.75px, #eff4ff 0.75px)',
                backgroundSize: '24px 24px'
              }}
            />
          )}

          <div 
            className="transition-transform duration-200 relative bg-white p-3 rounded-lg shadow-lg border border-outline-variant/40"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          >
            {/* Corner Drafting Markers */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-primary/40 pointer-events-none"></div>
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-primary/40 pointer-events-none"></div>
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-primary/40 pointer-events-none"></div>
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-primary/40 pointer-events-none"></div>

            <img
              src={imageUrl}
              alt={title}
              className="max-h-[440px] w-auto object-contain rounded select-none"
              referrerPolicy="no-referrer"
            />

            {/* Overlaid Technical Dimension Annotations */}
            {showDimensions && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                <div className="flex justify-between items-center text-[10px] font-mono text-secondary font-bold bg-white/80 px-2 py-0.5 rounded backdrop-blur-xs w-fit">
                  <span>← 420 mm (A3) →</span>
                </div>
                <div className="self-end bg-primary-container/90 text-on-primary text-[10px] font-mono p-1.5 rounded shadow-sm">
                  <div>IES SANTA EULALIA · DIBUJO TÉCNICO I</div>
                  <div className="text-secondary-fixed">Plano N.º 02/04 · Escala {specs.scale}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-surface-container-lowest border-t border-surface-container flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-col min-w-0">
            <p className="font-body-sm text-body-sm text-on-surface line-clamp-1">{description}</p>
            <div className="flex items-center gap-3 text-xs text-on-surface-variant font-mono mt-0.5">
              <span>{specs.tool}</span>
              <span>·</span>
              <span>UNE-EN ISO 128-20</span>
              <span>·</span>
              <button 
                onClick={() => setShowDimensions(!showDimensions)}
                className="text-secondary underline cursor-pointer"
              >
                {showDimensions ? 'Ocultar cotas' : 'Mostrar cotas'}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `${title.replace(/\s+/g, '_')}.png`;
                link.target = '_blank';
                link.click();
              }}
              className="px-3 py-2 rounded-xl bg-surface-container text-on-surface font-title-sm text-xs font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Descargar Lámina</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-title-sm text-xs font-semibold hover:bg-secondary transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
