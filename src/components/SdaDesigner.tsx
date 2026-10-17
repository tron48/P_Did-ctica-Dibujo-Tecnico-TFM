import React, { useState } from 'react';
import { CURRICULUM_CE_OPTIONS, CURRICULUM_BLOCK_OPTIONS } from '../data/curriculumStructure';
import { CompetencyRow, SaberRow, SdaData } from '../types';

interface SdaDesignerProps {
  initialTitle?: string;
  initialTiming?: string;
  onSaveToApp?: (designedSda: Partial<SdaData>) => void;
  onShowToast: (message: string) => void;
}

export const SdaDesigner: React.FC<SdaDesignerProps> = ({
  initialTitle = '',
  initialTiming = '',
  onSaveToApp,
  onShowToast
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [timing, setTiming] = useState(initialTiming);

  // 1. Concreción Competencial rows
  const [competencyRows, setCompetencyRows] = useState<CompetencyRow[]>([
    {
      id: 'comp-row-1',
      ceId: 'ce-1',
      criterionId: ''
    }
  ]);

  // 2. Saberes Básicos Movilizados rows
  const [saberRows, setSaberRows] = useState<SaberRow[]>([
    {
      id: 'saber-row-1',
      blockId: 'block-d',
      saberId: '',
      subblockId: ''
    }
  ]);

  // Handlers for Competencies
  const handleAddCompetencyRow = () => {
    const newId = `comp-row-${Date.now()}`;
    setCompetencyRows((prev) => [
      ...prev,
      { id: newId, ceId: '', criterionId: '' }
    ]);
  };

  const handleRemoveCompetencyRow = (id: string) => {
    if (competencyRows.length === 1) {
      setCompetencyRows([{ id: `comp-row-${Date.now()}`, ceId: '', criterionId: '' }]);
      return;
    }
    setCompetencyRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleCeChange = (rowId: string, newCeId: string) => {
    setCompetencyRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            ceId: newCeId,
            criterionId: '' // reset dependent criterion when CE changes
          };
        }
        return row;
      })
    );
  };

  const handleCriterionChange = (rowId: string, newCritId: string) => {
    setCompetencyRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, criterionId: newCritId } : row))
    );
  };

  // Handlers for Saberes
  const handleAddSaberRow = () => {
    const newId = `saber-row-${Date.now()}`;
    setSaberRows((prev) => [
      ...prev,
      { id: newId, blockId: '', saberId: '', subblockId: '' }
    ]);
  };

  const handleRemoveSaberRow = (id: string) => {
    if (saberRows.length === 1) {
      setSaberRows([{ id: `saber-row-${Date.now()}`, blockId: '', saberId: '', subblockId: '' }]);
      return;
    }
    setSaberRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleBlockChange = (rowId: string, newBlockId: string) => {
    setSaberRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            blockId: newBlockId,
            saberId: '', // reset dependent saber
            subblockId: '' // reset dependent subblock
          };
        }
        return row;
      })
    );
  };

  const handleSaberChange = (rowId: string, newSaberId: string) => {
    setSaberRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            saberId: newSaberId,
            subblockId: '' // reset dependent subblock
          };
        }
        return row;
      })
    );
  };

  const handleSubblockChange = (rowId: string, newSubblock: string) => {
    setSaberRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, subblockId: newSubblock } : row))
    );
  };

  // Clear / Reset
  const handleReset = () => {
    setTitle('');
    setTiming('');
    setCompetencyRows([{ id: `comp-row-${Date.now()}`, ceId: '', criterionId: '' }]);
    setSaberRows([{ id: `saber-row-${Date.now()}`, blockId: '', saberId: '', subblockId: '' }]);
    onShowToast('Diseñador restablecido a nueva Situación de Aprendizaje.');
  };

  // Print / PDF
  const handlePrint = () => {
    window.print();
  };

  // Save to App
  const handleSave = () => {
    if (!title.trim()) {
      onShowToast('Por favor, indica un título para la Situación de Aprendizaje.');
      return;
    }

    if (onSaveToApp) {
      onSaveToApp({
        title,
        timing: timing || '16 ses. (4 sem. / 2º Trim.)'
      });
    }
    onShowToast(`SdA "${title.slice(0, 32)}..." guardada y sincronizada.`);
  };

  return (
    <div className="bg-white text-slate-800 rounded-xl shadow-md border border-slate-200 overflow-hidden p-6 md:p-8 font-sans">
      {/* Title Header with Deep Blue Accent Line */}
      <div className="border-b-2 border-primary pb-3 mb-6">
        <h1 className="font-headline-sm md:font-headline-md text-xl md:text-2xl font-bold text-primary tracking-tight">
          Diseñador de Situaciones de Aprendizaje (Dibujo Técnico I - Extremadura)
        </h1>
      </div>

      {/* Main Form Fields: Title & Timing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Título de la Situación de Aprendizaje:
          </label>
          <input
            type="text"
            placeholder="Ej. El diseño geométrico en la arquitectura vernácula extremeña"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Temporalización / Trimestre:
          </label>
          <input
            type="text"
            placeholder="Ej. 12 sesiones (1.er Trimestre)"
            value={timing}
            onChange={(e) => setTiming(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* 1. Concreción Competencial */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-base md:text-lg font-bold text-secondary">
            1. Concreción Competencial
          </h2>
          <button
            type="button"
            onClick={handleAddCompetencyRow}
            className="px-3.5 py-1.5 bg-[#006398] hover:bg-[#004f7a] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>+</span>
            <span>Añadir Competencia / Criterio</span>
          </button>
        </div>

        {/* Competencies Table / Rows */}
        <div className="overflow-x-auto border border-slate-200 rounded-md bg-white">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f1f5f9] text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-[42%]">Competencia Específica</th>
                <th className="p-3 w-[38%]">Criterio de Evaluación</th>
                <th className="p-3 w-[15%]">Perfil de Salida</th>
                <th className="p-3 w-[5%] text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {competencyRows.map((row) => {
                const selectedCe = CURRICULUM_CE_OPTIONS.find((c) => c.id === row.ceId);
                const availableCriteria = selectedCe ? selectedCe.criteria : [];
                const selectedCrit = availableCriteria.find((cr) => cr.id === row.criterionId);
                const perfilSalida = selectedCrit ? selectedCrit.perfilSalida : '-';

                return (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Dropdown 1: Competencia Específica */}
                    <td className="p-2.5">
                      <select
                        value={row.ceId}
                        onChange={(e) => handleCeChange(row.id, e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary truncate"
                      >
                        <option value="">-- Seleccione una Competencia Específica --</option>
                        {CURRICULUM_CE_OPTIONS.map((ce) => (
                          <option key={ce.id} value={ce.id}>
                            {ce.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Dropdown 2: Criterio de Evaluación (Cascading) */}
                    <td className="p-2.5">
                      <select
                        value={row.criterionId}
                        disabled={!row.ceId}
                        onChange={(e) => handleCriterionChange(row.id, e.target.value)}
                        className={`w-full p-2 border rounded text-xs transition-colors truncate ${
                          !row.ceId
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-white border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary'
                        }`}
                      >
                        <option value="">
                          {!row.ceId ? '-- Seleccione primero una CE --' : '-- Seleccione un Criterio --'}
                        </option>
                        {availableCriteria.map((cr) => (
                          <option key={cr.id} value={cr.id}>
                            {cr.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Box 3: Perfil de Salida (Auto-resolved) */}
                    <td className="p-2.5">
                      <div className="p-2 bg-sky-50 border border-sky-200 rounded text-sky-900 text-xs font-bold truncate text-center">
                        {perfilSalida}
                      </div>
                    </td>

                    {/* Delete button [X] */}
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetencyRow(row.id)}
                        className="w-7 h-7 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded flex items-center justify-center font-bold text-xs mx-auto transition-colors shadow-xs"
                        title="Eliminar fila"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Saberes Básicos Movilizados */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-base md:text-lg font-bold text-secondary">
            2. Saberes Básicos Movilizados
          </h2>
          <button
            type="button"
            onClick={handleAddSaberRow}
            className="px-3.5 py-1.5 bg-[#006398] hover:bg-[#004f7a] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>+</span>
            <span>Añadir Saber Básico</span>
          </button>
        </div>

        {/* Saberes Table / Rows */}
        <div className="overflow-x-auto border border-slate-200 rounded-md bg-white">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f1f5f9] text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-[26%]">Bloque</th>
                <th className="p-3 w-[34%]">Saber Relacionado</th>
                <th className="p-3 w-[35%]">Subbloque / Concreción Curricular</th>
                <th className="p-3 w-[5%] text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {saberRows.map((row) => {
                const selectedBlock = CURRICULUM_BLOCK_OPTIONS.find((b) => b.id === row.blockId);
                const availableSaberes = selectedBlock ? selectedBlock.saberes : [];
                const selectedSaber = availableSaberes.find((s) => s.id === row.saberId);
                const availableSubblocks = selectedSaber ? selectedSaber.subbloques : [];

                return (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Dropdown 1: Bloque */}
                    <td className="p-2.5">
                      <select
                        value={row.blockId}
                        onChange={(e) => handleBlockChange(row.id, e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary truncate"
                      >
                        <option value="">-- Seleccione Bloque --</option>
                        {CURRICULUM_BLOCK_OPTIONS.map((blk) => (
                          <option key={blk.id} value={blk.id}>
                            {blk.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Dropdown 2: Saber Relacionado (Cascading from Bloque) */}
                    <td className="p-2.5">
                      <select
                        value={row.saberId}
                        disabled={!row.blockId}
                        onChange={(e) => handleSaberChange(row.id, e.target.value)}
                        className={`w-full p-2 border rounded text-xs transition-colors truncate ${
                          !row.blockId
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-white border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary'
                        }`}
                      >
                        <option value="">
                          {!row.blockId ? '-- Seleccione Bloque --' : '-- Seleccione Saber --'}
                        </option>
                        {availableSaberes.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Dropdown 3: Subbloque / Concreción Curricular (Cascading from Saber) */}
                    <td className="p-2.5">
                      <select
                        value={row.subblockId}
                        disabled={!row.saberId}
                        onChange={(e) => handleSubblockChange(row.id, e.target.value)}
                        className={`w-full p-2 border rounded text-xs transition-colors truncate ${
                          !row.saberId
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-white border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary'
                        }`}
                      >
                        <option value="">
                          {!row.saberId ? '-- Seleccione Saber --' : '-- Seleccione Concreción --'}
                        </option>
                        {availableSubblocks.map((sub, idx) => (
                          <option key={idx} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Delete button [X] */}
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveSaberRow(row.id)}
                        className="w-7 h-7 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded flex items-center justify-center font-bold text-xs mx-auto transition-colors shadow-xs"
                        title="Eliminar fila"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons Toolbar at Bottom */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 flex-wrap">
        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-md text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <span className="text-sm">🖨️</span>
          <span>Imprimir / Guardar en PDF</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="px-5 py-2.5 bg-[#001428] hover:bg-[#0f2942] text-white rounded-md text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <span className="text-sm">🔄</span>
          <span>Nueva SdA (Limpiar)</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 bg-[#006398] hover:bg-[#004f7a] text-white rounded-md text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <span className="text-sm">💾</span>
          <span>Guardar en la Programación</span>
        </button>
      </div>
    </div>
  );
};
