import React, { useState } from 'react';

interface WeightEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: { ce1: number; ce2: number; ce3: number; ce4: number };
  onSave: (newWeights: { ce1: number; ce2: number; ce3: number; ce4: number }) => void;
}

export const WeightEditorModal: React.FC<WeightEditorModalProps> = ({
  isOpen,
  onClose,
  weights,
  onSave
}) => {
  const [ce1, setCe1] = useState(weights.ce1);
  const [ce2, setCe2] = useState(weights.ce2);
  const [ce3, setCe3] = useState(weights.ce3);
  const [ce4, setCe4] = useState(weights.ce4);

  if (!isOpen) return null;

  const total = ce1 + ce2 + ce3 + ce4;
  const isValid = total === 100;

  const handleSave = () => {
    if (isValid) {
      onSave({ ce1, ce2, ce3, ce4 });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest text-on-surface rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-surface-container animate-in zoom-in-95 duration-200">
        <div className="bg-primary-container text-on-primary p-5 flex items-center justify-between border-b border-primary/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container text-[22px]">tune</span>
            <div>
              <h3 className="font-title-md font-bold text-on-primary">
                Ponderación de Competencias Específicas
              </h3>
              <p className="font-label-code text-[11px] text-on-primary-container">
                Decreto 110/2022 LOMLOE · Marco Extremadura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-container-lowest/20 text-on-primary"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <p className="font-body-sm text-xs text-on-surface-variant">
            Ajusta los porcentajes de cada Competencia Específica para el curso 2027–2028. La suma total debe ser exactamente del 100%.
          </p>

          {/* CE 1 */}
          <div className="flex flex-col gap-1 p-3 bg-surface-container-low rounded-xl">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-secondary">C.E. 1 · Geometría Métrica</span>
              <span className="font-mono text-secondary font-bold">{ce1}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={ce1}
              onChange={(e) => setCe1(Number(e.target.value))}
              className="accent-secondary w-full"
            />
          </div>

          {/* CE 2 */}
          <div className="flex flex-col gap-1 p-3 bg-surface-container-low rounded-xl">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-secondary-container">C.E. 2 · Sistemas de Representación (Diédrico/Axon)</span>
              <span className="font-mono text-secondary font-bold">{ce2}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={ce2}
              onChange={(e) => setCe2(Number(e.target.value))}
              className="accent-secondary w-full"
            />
          </div>

          {/* CE 3 */}
          <div className="flex flex-col gap-1 p-3 bg-surface-container-low rounded-xl">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-tertiary-container">C.E. 3 · Normalización &amp; Croquizado</span>
              <span className="font-mono text-tertiary-container font-bold">{ce3}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={ce3}
              onChange={(e) => setCe3(Number(e.target.value))}
              className="accent-emerald-600 w-full"
            />
          </div>

          {/* CE 4 */}
          <div className="flex flex-col gap-1 p-3 bg-surface-container-low rounded-xl">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-surface-tint">C.E. 4 · Diseño Asistido (CAD)</span>
              <span className="font-mono text-on-surface-variant font-bold">{ce4}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={ce4}
              onChange={(e) => setCe4(Number(e.target.value))}
              className="accent-slate-600 w-full"
            />
          </div>

          {/* Balance Indicator */}
          <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-mono font-bold ${
            isValid ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error-container text-on-error-container'
          }`}>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">
                {isValid ? 'check_circle' : 'warning'}
              </span>
              <span>{isValid ? 'Distribución Balanceada' : 'Ajuste requerido'}</span>
            </span>
            <span>Total: {total}% / 100%</span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors"
            >
              Cancelar
            </button>
            <button
              disabled={!isValid}
              onClick={handleSave}
              className={`px-5 py-2 rounded-xl font-title-sm text-xs font-semibold transition-colors ${
                isValid
                  ? 'bg-primary-container text-on-primary hover:bg-secondary'
                  : 'bg-surface-container text-outline cursor-not-allowed'
              }`}
            >
              Guardar Ponderaciones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
