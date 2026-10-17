import React, { useState } from 'react';

interface Simulation3DModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Simulation3DModal: React.FC<Simulation3DModalProps> = ({ isOpen, onClose }) => {
  const [angle, setAngle] = useState(45); // 0 = original 3D position, 90 = full abatimiento
  const [showTraces, setShowTraces] = useState(true);
  const [showProjectionLines, setShowProjectionLines] = useState(true);

  if (!isOpen) return null;

  // Visual parameters for dihedral canvas
  const rad = (angle * Math.PI) / 180;
  const unfoldedFactor = angle / 90;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-primary/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest text-on-surface rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-surface-container">
        {/* Header */}
        <div className="bg-primary-container text-on-primary px-5 py-4 flex items-center justify-between border-b border-primary/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container text-[22px]">view_in_ar</span>
            <div>
              <h3 className="font-title-md font-bold text-on-primary">
                Simulador Diédrico 3D: Abatimiento de Plano Oblicuo
              </h3>
              <p className="font-label-code text-[11px] text-on-primary-container">
                Decreto 110/2022 · Criterio 2.1.1 · Preparación PAU / EBAU
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container-lowest/20 text-on-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 3D Visualizer Canvas (SVG geometric constructivism) */}
        <div className="p-4 bg-slate-900 text-slate-100 flex flex-col items-center justify-center relative min-h-[340px]">
          {/* Subtle grid background */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          <svg 
            viewBox="0 0 600 360" 
            className="w-full h-auto max-h-[320px] select-none"
          >
            <defs>
              <linearGradient id="planeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Horizontal Plane (PH) */}
            <polygon 
              points="100,200 480,200 540,320 160,320" 
              fill="#0f172a" 
              stroke="#334155" 
              strokeWidth="1.5" 
            />
            <text x="500" y="300" fill="#64748b" fontSize="12" fontFamily="JetBrains Mono">P.H.</text>

            {/* Vertical Plane (PV) */}
            <polygon 
              points="100,50 480,50 480,200 100,200" 
              fill="#1e293b" 
              stroke="#334155" 
              strokeWidth="1.5" 
            />
            <text x="490" y="80" fill="#64748b" fontSize="12" fontFamily="JetBrains Mono">P.V.</text>

            {/* Tierra Line (Línea de Tierra LT) */}
            <line x1="80" y1="200" x2="520" y2="200" stroke="#38bdf8" strokeWidth="2.5" />
            <text x="60" y="196" fill="#38bdf8" fontSize="13" fontWeight="bold" fontFamily="JetBrains Mono">L</text>
            <text x="525" y="196" fill="#38bdf8" fontSize="13" fontWeight="bold" fontFamily="JetBrains Mono">T</text>
            {/* LT Marks */}
            <line x1="85" y1="204" x2="85" y2="210" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="90" y1="204" x2="90" y2="210" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="510" y1="204" x2="510" y2="210" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="515" y1="204" x2="515" y2="210" stroke="#38bdf8" strokeWidth="1.5" />

            {/* Oblique Plane P' trace on PV */}
            {showTraces && (
              <>
                <line x1="220" y1="200" x2="140" y2="70" stroke="#fbbf24" strokeWidth="2.5" />
                <text x="125" y="65" fill="#fbbf24" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono">P' (traza vertical)</text>

                {/* Horizontal Trace P (axis of rotation/charnela) */}
                <line x1="220" y1="200" x2="360" y2="280" stroke="#fbbf24" strokeWidth="3" />
                <text x="370" y="290" fill="#fbbf24" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono">P (charnela)</text>
              </>
            )}

            {/* Unfolding Arc & Oblique Triangle ABC */}
            {/* 3D dynamic coordinates as angle rotates */}
            {(() => {
              const originX = 220;
              const originY = 200;

              // Vertex A on horizontal trace
              const ax = originX + 70;
              const ay = originY + 40;

              // Vertex B space position folding down
              const bx3d = originX - 40 + (unfoldedFactor * 80);
              const by3d = 120 + (unfoldedFactor * 140);

              // Vertex C space position
              const cx3d = originX + 110 - (unfoldedFactor * 10);
              const cy3d = 140 + (unfoldedFactor * 110);

              return (
                <g>
                  {/* Plane surface */}
                  <polygon
                    points={`${originX},${originY} ${ax},${ay} ${cx3d},${cy3d} ${bx3d},${by3d}`}
                    fill="url(#planeGrad)"
                    stroke="#34d399"
                    strokeWidth="2"
                  />

                  {/* Vertices */}
                  <circle cx={ax} cy={ay} r="4" fill="#34d399" />
                  <text x={ax + 8} y={ay + 4} fill="#a7f3d0" fontSize="11" fontFamily="JetBrains Mono">(A)</text>

                  <circle cx={bx3d} cy={by3d} r="4" fill="#38bdf8" />
                  <text x={bx3d - 22} y={by3d - 5} fill="#bae6fd" fontSize="11" fontFamily="JetBrains Mono">
                    {angle >= 85 ? '(B) V.M.' : "B' / B"}
                  </text>

                  <circle cx={cx3d} cy={cy3d} r="4" fill="#f43f5e" />
                  <text x={cx3d + 8} y={cy3d + 4} fill="#fecdd3" fontSize="11" fontFamily="JetBrains Mono">
                    {angle >= 85 ? '(C) V.M.' : "C' / C"}
                  </text>

                  {/* Projection perpendicular to charnela */}
                  {showProjectionLines && (
                    <line
                      x1={bx3d}
                      y1={by3d}
                      x2={bx3d + 30}
                      y2={by3d - 50}
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                  )}
                </g>
              );
            })()}

            {/* Indicator of True Magnitude status */}
            {angle >= 85 && (
              <g>
                <rect x="200" y="295" width="220" height="28" rx="6" fill="#047857" opacity="0.9" />
                <text x="310" y="313" fill="#ffffff" textAnchor="middle" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono">
                  ✓ VERDADERA MAGNITUD OBTENIDA
                </text>
              </g>
            )}
          </svg>

          {/* Real-time Angle & Stage Badge */}
          <div className="absolute top-3 left-3 bg-slate-800/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono flex items-center gap-2">
            <span className="text-amber-400">Giro Charnela:</span>
            <span className="text-white font-bold">{angle}° / 90°</span>
            <span className="text-slate-400">·</span>
            <span className={angle >= 85 ? 'text-emerald-400 font-bold' : 'text-sky-300'}>
              {angle >= 85 ? 'Abatido (100%)' : 'En rotación espacial'}
            </span>
          </div>
        </div>

        {/* Interactive Controls & Pedagogical Explanation */}
        <div className="p-5 flex flex-col gap-4 bg-surface-container-lowest">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-on-surface font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">rotate_right</span>
                Control de Abatimiento sobre Plano Horizontal:
              </span>
              <span className="font-mono text-secondary font-bold">{angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full accent-secondary h-2 bg-surface-container rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-on-surface-variant font-mono">
              <span>0° (Posición espacial 3D)</span>
              <span>45° (Proyección intermedia)</span>
              <span>90° (Abatido · Verdadera Magnitud)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => setAngle(0)}
              className="px-2 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-xs font-mono text-on-surface"
            >
              0° Reiniciar
            </button>
            <button
              onClick={() => setAngle(90)}
              className="px-2 py-1.5 rounded bg-secondary-fixed text-on-secondary-fixed text-xs font-mono font-bold hover:bg-secondary hover:text-on-secondary transition-colors"
            >
              90° Abatir Todo
            </button>
            <button
              onClick={() => setShowTraces(!showTraces)}
              className={`px-2 py-1.5 rounded text-xs font-mono transition-colors ${showTraces ? 'bg-amber-100 text-amber-900 font-semibold' : 'bg-surface-container text-on-surface'}`}
            >
              {showTraces ? 'Trazas: Vistas' : 'Trazas: Ocultas'}
            </button>
            <button
              onClick={() => setShowProjectionLines(!showProjectionLines)}
              className={`px-2 py-1.5 rounded text-xs font-mono transition-colors ${showProjectionLines ? 'bg-sky-100 text-sky-900 font-semibold' : 'bg-surface-container text-on-surface'}`}
            >
              {showProjectionLines ? 'Líneas ref: On' : 'Líneas ref: Off'}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low text-xs text-on-surface-variant flex items-start gap-2">
            <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">help</span>
            <p>
              <strong>Fundamento Geométrico:</strong> Al abatir el plano oblicuo alrededor de su traza horizontal (charnela <em>P</em>), el punto contenido en el espacio describe un arco de circunferencia perpendicular a dicha traza. Al alcanzar los 90°, el triángulo se visualiza sin distorsión proyectiva, permitiendo acotar ángulos y longitudes reales para la prueba de acceso a la universidad (PAU/EBAU).
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-primary-container text-on-primary font-title-sm text-xs font-semibold hover:bg-secondary transition-colors"
            >
              Cerrar Simulador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
