import React, { useState, useMemo } from 'react';
import { SdaData, NavTab } from '../types';
import { CURRICULUM_CE_OPTIONS, CURRICULUM_BLOCK_OPTIONS } from '../data/curriculumStructure';

interface MapaCurricularViewProps {
  sdas: SdaData[];
  onUpdateSdas: (updatedSdas: SdaData[]) => void;
  onNavigateToSda: (sdaId: string) => void;
  onNavigate: (tab: NavTab) => void;
  onShowToast: (message: string) => void;
}

export const MapaCurricularView: React.FC<MapaCurricularViewProps> = ({
  sdas,
  onUpdateSdas,
  onNavigateToSda,
  onNavigate,
  onShowToast
}) => {
  // Filters and search
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'covered'>('all');
  const [activeCategory, setActiveCategory] = useState<'all' | 'competencias' | 'criteria' | 'saberes'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assigningElement, setAssigningElement] = useState<{
    type: 'competencia' | 'criterion' | 'saber';
    id: string;
    code: string;
    label: string;
    ceId?: string;
  } | null>(null);

  // Expanded nodes in the tree
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'ce-section': true,
    'ce-1': true,
    'ce-2': true,
    'ce-3': true,
    'ce-4': true,
    'ce-5': true,
    'block-a': true,
    'block-b': true,
    'block-c': true,
    'block-d': true
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {
      'ce-section': true
    };
    CURRICULUM_CE_OPTIONS.forEach((ce) => {
      allExpanded[ce.id] = true;
    });
    CURRICULUM_BLOCK_OPTIONS.forEach((b) => {
      allExpanded[b.id] = true;
      b.saberes.forEach((s) => {
        allExpanded[s.id] = true;
      });
    });
    setExpandedNodes(allExpanded);
    onShowToast('Todas las ramas del currículo expandidas.');
  };

  const handleCollapseAll = () => {
    setExpandedNodes({});
    onShowToast('Todas las ramas del currículo colapsadas.');
  };

  // Color map for SdAs
  const sdaColors = useMemo(() => {
    const colors = [
      { bg: 'bg-[#006398]', badge: 'bg-sky-50 text-sky-900 border-sky-200', text: 'text-[#006398]' },
      { bg: 'bg-[#0284c7]', badge: 'bg-sky-100 text-sky-900 border-sky-300', text: 'text-[#0284c7]' },
      { bg: 'bg-[#059669]', badge: 'bg-emerald-50 text-emerald-900 border-emerald-200', text: 'text-[#059669]' },
      { bg: 'bg-[#7c3aed]', badge: 'bg-purple-50 text-purple-900 border-purple-200', text: 'text-[#7c3aed]' },
      { bg: 'bg-[#d97706]', badge: 'bg-amber-50 text-amber-900 border-amber-200', text: 'text-[#d97706]' }
    ];
    const map = new Map<string, typeof colors[0]>();
    sdas.forEach((s, idx) => {
      map.set(s.id, colors[idx % colors.length]);
    });
    return map;
  }, [sdas]);

  // Compute coverage for Competencias Específicas
  const competenciasAnalysis = useMemo(() => {
    const totalCount = CURRICULUM_CE_OPTIONS.length; // 5
    let coveredCount = 0;

    const data = CURRICULUM_CE_OPTIONS.map((ce) => {
      // Which SdAs have this CE checked?
      const matchingSdas = sdas.filter((sda) =>
        sda.competenciasEspecificas?.some((c) => {
          const ceMatch = c.code === ce.code || ce.code.endsWith(c.code) || c.id === ce.id;
          return ceMatch && c.checked;
        })
      );

      const isCovered = matchingSdas.length > 0;
      if (isCovered) coveredCount++;

      // Compute criteria of this CE that are covered in SdAs
      const totalCriteria = ce.criteria.length;
      const coveredCriteria = ce.criteria.filter((crit) =>
        sdas.some((sda) =>
          sda.criteriosEvaluacion?.some((c) => (c.code === crit.code || c.code.endsWith(crit.code)) && c.checked)
        )
      ).length;

      // Extract unique Perfil de Salida descriptors for this CE
      const perfiles = Array.from(
        new Set(
          ce.criteria
            .flatMap((cr) => cr.perfilSalida.split(','))
            .map((p) => p.trim())
            .filter(Boolean)
        )
      ).join(', ');

      return {
        ...ce,
        matchingSdas,
        count: matchingSdas.length,
        isCovered,
        totalCriteria,
        coveredCriteria,
        percentCriteria: Math.round((coveredCriteria / totalCriteria) * 100),
        perfiles
      };
    });

    return {
      ceList: data,
      totalCount,
      coveredCount,
      percent: Math.round((coveredCount / totalCount) * 100)
    };
  }, [sdas]);

  // Compute coverage for each Criterion
  const criteriaAnalysis = useMemo(() => {
    let totalCount = 0;
    let coveredCount = 0;

    const data = CURRICULUM_CE_OPTIONS.map((ce) => {
      const criteriaResults = ce.criteria.map((crit) => {
        totalCount++;
        // Find which SdAs have this criterion active
        const matchingSdas = sdas.filter((sda) =>
          sda.criteriosEvaluacion?.some((c) => {
            const codeMatch = c.code === crit.code || c.code.endsWith(crit.code);
            return codeMatch && c.checked;
          })
        );

        const isCovered = matchingSdas.length > 0;
        if (isCovered) coveredCount++;

        return {
          ...crit,
          parentCeId: ce.id,
          parentCeCode: ce.code,
          matchingSdas,
          count: matchingSdas.length,
          isCovered
        };
      });

      const ceMatchingSdas = sdas.filter((sda) =>
        sda.competenciasEspecificas?.some((c) => {
          const ceMatch = c.code === ce.code || ce.code.endsWith(c.code) || c.id === ce.id;
          return ceMatch && c.checked;
        })
      );

      const ceCoveredCriteria = criteriaResults.filter((c) => c.isCovered).length;

      return {
        ...ce,
        criteria: criteriaResults,
        coveredCount: ceCoveredCriteria,
        totalCriteria: criteriaResults.length,
        percent: Math.round((ceCoveredCriteria / criteriaResults.length) * 100),
        matchingSdas: ceMatchingSdas
      };
    });

    return {
      ceData: data,
      totalCount,
      coveredCount,
      percent: totalCount > 0 ? Math.round((coveredCount / totalCount) * 100) : 0
    };
  }, [sdas]);

  // Compute coverage for Saberes Básicos
  const saberesAnalysis = useMemo(() => {
    let totalCount = 0;
    let coveredCount = 0;

    const blocksData = CURRICULUM_BLOCK_OPTIONS.map((block) => {
      let blockTotal = 0;
      let blockCovered = 0;

      const saberesData = block.saberes.map((saber) => {
        const subbloquesData = saber.subbloques.map((subbloque) => {
          totalCount++;
          blockTotal++;

          // Check which SdAs contain this subbloque or text matching
          const matchingSdas = sdas.filter((sda) => {
            if (!sda.saberesBasicos) return false;
            return sda.saberesBasicos.some((s) => {
              const str1 = s.toLowerCase().trim();
              const str2 = subbloque.toLowerCase().trim();
              return (
                str1 === str2 ||
                str1.includes(str2.slice(0, 22)) ||
                str2.includes(str1.slice(0, 22))
              );
            });
          });

          const isCovered = matchingSdas.length > 0;
          if (isCovered) {
            coveredCount++;
            blockCovered++;
          }

          return {
            label: subbloque,
            matchingSdas,
            count: matchingSdas.length,
            isCovered
          };
        });

        const saberCovered = subbloquesData.filter((sb) => sb.isCovered).length;

        return {
          ...saber,
          subbloquesData,
          coveredCount: saberCovered,
          totalCount: subbloquesData.length
        };
      });

      return {
        ...block,
        saberes: saberesData,
        coveredCount: blockCovered,
        totalCount: blockTotal,
        percent: blockTotal > 0 ? Math.round((blockCovered / blockTotal) * 100) : 0
      };
    });

    return {
      blocksData,
      totalCount,
      coveredCount,
      percent: totalCount > 0 ? Math.round((coveredCount / totalCount) * 100) : 0
    };
  }, [sdas]);

  // Global Combined Coverage Percentage across all three curricular pillars
  const globalTotalElements = competenciasAnalysis.totalCount + criteriaAnalysis.totalCount + saberesAnalysis.totalCount;
  const globalCoveredElements = competenciasAnalysis.coveredCount + criteriaAnalysis.coveredCount + saberesAnalysis.coveredCount;
  const globalPercent = globalTotalElements > 0 ? Math.round((globalCoveredElements / globalTotalElements) * 100) : 0;
  const pendingCount = globalTotalElements - globalCoveredElements;

  // Add/Link an element (Competencia, Criterion, Saber) to an SdA
  const handleAssignToSda = (targetSdaId: string) => {
    if (!assigningElement) return;

    const targetSda = sdas.find((s) => s.id === targetSdaId);
    if (!targetSda) return;

    if (assigningElement.type === 'competencia') {
      // Add or check Competencia Específica in this SdA
      const updatedSdas = sdas.map((s) => {
        if (s.id === targetSdaId) {
          const currentCes = [...(s.competenciasEspecificas || [])];
          const existingIdx = currentCes.findIndex(
            (c) => c.code === assigningElement.code || assigningElement.code.endsWith(c.code)
          );

          if (existingIdx >= 0) {
            currentCes[existingIdx] = { ...currentCes[existingIdx], checked: true };
          } else {
            currentCes.push({
              id: assigningElement.id,
              code: assigningElement.code,
              title: assigningElement.label,
              description: assigningElement.label,
              checked: true
            });
          }

          return { ...s, competenciasEspecificas: currentCes };
        }
        return s;
      });

      onUpdateSdas(updatedSdas);
      onShowToast(`Competencia ${assigningElement.code} vinculada a ${targetSda.code}.`);
    } else if (assigningElement.type === 'criterion') {
      // Add or check criterion in this SdA
      const updatedSdas = sdas.map((s) => {
        if (s.id === targetSdaId) {
          const currentCrits = [...(s.criteriosEvaluacion || [])];
          const existingIdx = currentCrits.findIndex((c) => c.code === assigningElement.code);

          if (existingIdx >= 0) {
            currentCrits[existingIdx] = { ...currentCrits[existingIdx], checked: true };
          } else {
            currentCrits.push({
              id: `crit-${assigningElement.code.replace('.', '-')}-${Date.now()}`,
              code: assigningElement.code,
              title: assigningElement.label,
              checked: true
            });
          }

          // Also ensure parent CE is checked
          const currentCes = [...(s.competenciasEspecificas || [])];
          if (assigningElement.ceId) {
            const ceOption = CURRICULUM_CE_OPTIONS.find((ce) => ce.id === assigningElement.ceId);
            if (ceOption) {
              const existingCeIdx = currentCes.findIndex(
                (ce) => ce.code === ceOption.code || ceOption.code.endsWith(ce.code)
              );
              if (existingCeIdx >= 0) {
                currentCes[existingCeIdx] = { ...currentCes[existingCeIdx], checked: true };
              } else {
                currentCes.push({
                  id: ceOption.id,
                  code: ceOption.code,
                  title: ceOption.label,
                  description: ceOption.label,
                  checked: true
                });
              }
            }
          }

          return { ...s, criteriosEvaluacion: currentCrits, competenciasEspecificas: currentCes };
        }
        return s;
      });

      onUpdateSdas(updatedSdas);
      onShowToast(`Criterio ${assigningElement.code} asignado a ${targetSda.code}.`);
    } else {
      // Add saber to this SdA
      const updatedSdas = sdas.map((s) => {
        if (s.id === targetSdaId) {
          const currentSaberes = [...(s.saberesBasicos || [])];
          if (!currentSaberes.includes(assigningElement.label)) {
            currentSaberes.push(assigningElement.label);
          }
          return { ...s, saberesBasicos: currentSaberes };
        }
        return s;
      });

      onUpdateSdas(updatedSdas);
      onShowToast(`Saber básico asignado a ${targetSda.code}.`);
    }

    setAssigningElement(null);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Hero Header */}
      <section className="px-4 md:px-6 pt-5 pb-3">
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/90 relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-900 border border-sky-200 text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px] text-secondary">account_tree</span>
              <span>Matriz Oficial de Concreción y Trazabilidad Curricular</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200">
                Curso 2027–2028 · LOMLOE
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
                Decreto 110/2022 Extremadura
              </span>
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Mapa de Cobertura Curricular: Competencias, Criterios y Saberes
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Supervisa qué <strong>Competencias Específicas</strong>, <strong>Criterios de Evaluación</strong> y <strong>Saberes Básicos</strong> están cubiertos en las <strong>{sdas.length} Situaciones de Aprendizaje</strong> planificadas, detecta elementos pendientes y visualiza la frecuencia de aparición de cada elemento.
          </p>

          {/* KPI Metrics Cards (4 Pillars) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-1">
            {/* 1. Competencias Específicas */}
            <div 
              onClick={() => setActiveCategory('competencias')}
              className={`rounded-xl p-3 border transition-all cursor-pointer flex flex-col justify-between ${
                activeCategory === 'competencias' ? 'bg-sky-50 border-secondary' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  Competencias Específicas
                </span>
                <span className="material-symbols-outlined text-[16px] text-secondary">grade</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-slate-900">
                  {competenciasAnalysis.coveredCount}/{competenciasAnalysis.totalCount}
                </span>
                <span className="text-[11px] text-slate-500">({competenciasAnalysis.percent}%)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-secondary transition-all"
                  style={{ width: `${competenciasAnalysis.percent}%` }}
                />
              </div>
            </div>

            {/* 2. Criterios de Evaluación */}
            <div 
              onClick={() => setActiveCategory('criteria')}
              className={`rounded-xl p-3 border transition-all cursor-pointer flex flex-col justify-between ${
                activeCategory === 'criteria' ? 'bg-sky-50 border-secondary' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Criterios de Evaluación
                </span>
                <span className="material-symbols-outlined text-[16px] text-slate-400">checklist</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-slate-900">
                  {criteriaAnalysis.coveredCount}/{criteriaAnalysis.totalCount}
                </span>
                <span className="text-[11px] text-slate-500">({criteriaAnalysis.percent}%)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-secondary transition-all"
                  style={{ width: `${criteriaAnalysis.percent}%` }}
                />
              </div>
            </div>

            {/* 3. Saberes Básicos */}
            <div 
              onClick={() => setActiveCategory('saberes')}
              className={`rounded-xl p-3 border transition-all cursor-pointer flex flex-col justify-between ${
                activeCategory === 'saberes' ? 'bg-sky-50 border-secondary' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Saberes Básicos (Bloques)
                </span>
                <span className="material-symbols-outlined text-[16px] text-slate-400">menu_book</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-slate-900">
                  {saberesAnalysis.coveredCount}/{saberesAnalysis.totalCount}
                </span>
                <span className="text-[11px] text-slate-500">({saberesAnalysis.percent}%)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-secondary transition-all"
                  style={{ width: `${saberesAnalysis.percent}%` }}
                />
              </div>
            </div>

            {/* 4. Global Coverage & Status */}
            <div className={`rounded-xl p-3 border flex flex-col justify-between ${
              pendingCount === 0
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                  Cobertura Total
                </span>
                <span className="text-xs font-bold">{globalPercent}%</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold">
                  {pendingCount === 0 ? '100% Cerrado' : `${pendingCount} Pend.`}
                </span>
              </div>
              <span className="text-[11px] font-medium mt-1">
                {pendingCount === 0
                  ? 'Todas las CE, Criterios y Saberes cubiertos'
                  : 'Filtra por pendientes para completar'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Control Bar: Filters, Categories & Tree Actions */}
      <section className="px-4 md:px-6 py-2">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Category Switcher Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeCategory === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vista Completa
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('competencias')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeCategory === 'competencias'
                    ? 'bg-secondary text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">grade</span>
                <span>Competencias Específicas (5)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('criteria')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeCategory === 'criteria'
                    ? 'bg-secondary text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">checklist</span>
                <span>Criterios de Evaluación ({criteriaAnalysis.totalCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('saberes')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeCategory === 'saberes'
                    ? 'bg-secondary text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                <span>Saberes Básicos (Bloques A-D)</span>
              </button>
            </div>

            {/* Tree Collapse / Expand All Buttons */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={handleExpandAll}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                title="Desplegar todas las ramas"
              >
                <span className="material-symbols-outlined text-[16px]">unfold_more</span>
                <span>Expandir todo</span>
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                title="Plegar todas las ramas"
              >
                <span className="material-symbols-outlined text-[16px]">unfold_less</span>
                <span>Plegar todo</span>
              </button>
            </div>
          </div>

          {/* Quick Filters Row (Todos, Solo Pendientes, Solo Cubiertos) + Search */}
          <div className="flex items-center justify-between gap-2.5 flex-wrap pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Filtro de Estado:
              </span>
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  filterStatus === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Todos</span>
                <span className="text-[10px] opacity-70">({globalTotalElements})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filterStatus === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>⚪ Solo Pendientes (Faltan)</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white/20">
                  {pendingCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('covered')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  filterStatus === 'covered'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>🟢 Solo Cubiertos</span>
                <span className="text-[10px] opacity-80">({globalCoveredElements})</span>
              </button>
            </div>

            {/* Keyword Search Input */}
            <div className="relative min-w-[220px] max-w-xs flex-1">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar competencia, criterio o saber..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Collapsible Accordion Tree Section */}
      <section className="px-4 md:px-6 pt-2 flex flex-col gap-5">
        {/* ================================================================ */}
        {/* SECTION 1: COMPETENCIAS ESPECÍFICAS (CE 1 a CE 5) */}
        {/* ================================================================ */}
        {(activeCategory === 'all' || activeCategory === 'competencias') && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                <h2 className="text-base font-bold text-slate-900">
                  1. Competencias Específicas de Dibujo Técnico I (Decreto 110/2022)
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {competenciasAnalysis.coveredCount} de {competenciasAnalysis.totalCount} cubiertas
              </span>
            </div>

            <div className="space-y-3">
              {competenciasAnalysis.ceList.map((ce) => {
                // Filter logic
                if (filterStatus === 'pending' && ce.isCovered) return null;
                if (filterStatus === 'covered' && !ce.isCovered) return null;
                if (searchQuery) {
                  const q = searchQuery.toLowerCase();
                  const match =
                    ce.code.toLowerCase().includes(q) ||
                    ce.label.toLowerCase().includes(q) ||
                    ce.perfiles.toLowerCase().includes(q);
                  if (!match) return null;
                }

                return (
                  <div
                    key={ce.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs transition-all flex flex-col gap-3 ${
                      ce.isCovered
                        ? 'border-slate-200 hover:border-secondary/40'
                        : 'border-amber-200 bg-amber-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-2.5 min-w-0">
                        {ce.isCovered ? (
                          <span
                            className="material-symbols-outlined text-emerald-600 text-[22px] shrink-0 mt-0.5"
                            title="Competencia incluida en la programación"
                          >
                            check_circle
                          </span>
                        ) : (
                          <span
                            className="material-symbols-outlined text-amber-500 text-[22px] shrink-0 mt-0.5 animate-pulse"
                            title="Competencia pendiente de incluir en alguna SdA"
                          >
                            error
                          </span>
                        )}

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-md">
                              {ce.code}
                            </span>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                ce.count > 0
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-amber-100 text-amber-900 font-bold'
                              }`}
                            >
                              {ce.count > 0
                                ? `Abordada en ${ce.count} ${ce.count === 1 ? 'SdA' : 'SdAs'}`
                                : '0 apariciones · Pendiente'}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {ce.coveredCriteria}/{ce.totalCriteria} criterios cubiertos ({ce.percentCriteria}%)
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                            {ce.label}
                          </h3>

                          <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">Descriptores Perfil de Salida:</span>
                            <span className="bg-sky-50 text-sky-800 px-2 py-0.5 rounded border border-sky-200 text-[11px] font-mono">
                              {ce.perfiles}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions & SdA Badges */}
                      <div className="flex items-center gap-2 ml-auto shrink-0 flex-wrap">
                        {ce.matchingSdas.map((s) => {
                          const c = sdaColors.get(s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => onNavigateToSda(s.id)}
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-transform hover:scale-105 flex items-center gap-1 ${
                                c?.badge || 'bg-slate-100 text-slate-800 border-slate-200'
                              }`}
                              title={`Abrir Ficha de ${s.title}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">link</span>
                              <span>{s.code}</span>
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() =>
                            setAssigningElement({
                              type: 'competencia',
                              id: ce.id,
                              code: ce.code,
                              label: ce.label
                            })
                          }
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 text-secondary hover:bg-secondary hover:text-white border border-sky-200 transition-colors flex items-center gap-1 shadow-xs"
                          title="Vincular esta Competencia Específica a una SdA"
                        >
                          <span className="material-symbols-outlined text-[15px]">add</span>
                          <span>Asignar CE</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* SECTION 2: CRITERIOS DE EVALUACIÓN (POR COMPETENCIA ESPECÍFICA) */}
        {/* ================================================================ */}
        {(activeCategory === 'all' || activeCategory === 'criteria') && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                <h2 className="text-base font-bold text-slate-900">
                  2. Criterios de Evaluación por Competencia Específica
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {criteriaAnalysis.coveredCount} de {criteriaAnalysis.totalCount} criterios cubiertos
              </span>
            </div>

            <div className="space-y-3">
              {criteriaAnalysis.ceData.map((ce) => {
                const isExpanded = !!expandedNodes[ce.id];

                // Filter criteria inside this CE based on filterStatus & searchQuery
                const visibleCriteria = ce.criteria.filter((crit) => {
                  if (filterStatus === 'pending' && crit.isCovered) return false;
                  if (filterStatus === 'covered' && !crit.isCovered) return false;
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return (
                      crit.code.toLowerCase().includes(q) ||
                      crit.label.toLowerCase().includes(q) ||
                      crit.perfilSalida.toLowerCase().includes(q)
                    );
                  }
                  return true;
                });

                if ((searchQuery || filterStatus !== 'all') && visibleCriteria.length === 0) {
                  return null;
                }

                const ceBadgeColor =
                  ce.percent === 100
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : ce.percent > 0
                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200';

                return (
                  <div
                    key={ce.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                  >
                    {/* Node Header (Level 1) */}
                    <div
                      onClick={() => toggleNode(ce.id)}
                      className="p-4 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between gap-3 border-b border-slate-200 transition-colors select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`material-symbols-outlined text-[20px] text-slate-500 transition-transform ${
                            isExpanded ? 'rotate-90 text-secondary font-bold' : ''
                          }`}
                        >
                          chevron_right
                        </span>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                              {ce.code}
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${ceBadgeColor}`}>
                              {ce.coveredCount} de {ce.totalCriteria} criterios ({ce.percent}%)
                            </span>
                          </div>
                          <h3 className="text-xs md:text-sm font-bold text-slate-800 mt-1 truncate">
                            {ce.label}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {ce.matchingSdas.length > 0 && (
                          <div className="hidden sm:flex items-center gap-1">
                            {ce.matchingSdas.map((s) => {
                              const c = sdaColors.get(s.id);
                              return (
                                <span
                                  key={s.id}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                    c?.badge || 'bg-slate-100 text-slate-700'
                                  }`}
                                  title={`Abordada en ${s.title}`}
                                >
                                  {s.code}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <span className="text-[11px] font-semibold text-slate-400">
                          {visibleCriteria.length} {visibleCriteria.length === 1 ? 'criterio' : 'criterios'}
                        </span>
                      </div>
                    </div>

                    {/* Node Children: Criteria (Level 2) */}
                    {isExpanded && (
                      <div className="p-3 md:p-4 bg-white flex flex-col gap-2.5">
                        {visibleCriteria.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-2 text-center">
                            No hay criterios que coincidan con los filtros seleccionados.
                          </p>
                        ) : (
                          visibleCriteria.map((crit) => (
                            <div
                              key={crit.id}
                              className={`p-3 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                                crit.isCovered
                                  ? 'bg-slate-50/70 border-slate-200 hover:border-secondary/40'
                                  : 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                              }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                {crit.isCovered ? (
                                  <span
                                    className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5"
                                    title="Cubierto en la programación"
                                  >
                                    check_circle
                                  </span>
                                ) : (
                                  <span
                                    className="material-symbols-outlined text-amber-500 text-[20px] shrink-0 mt-0.5 animate-pulse"
                                    title="Pendiente de incluir en alguna SdA"
                                  >
                                    error
                                  </span>
                                )}

                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                      Criterio {crit.code}
                                    </span>
                                    <span
                                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                        crit.count > 0
                                          ? 'bg-emerald-100 text-emerald-900'
                                          : 'bg-amber-100 text-amber-900 font-bold'
                                      }`}
                                    >
                                      {crit.count > 0
                                        ? `Presente en ${crit.count} ${crit.count === 1 ? 'SdA' : 'SdAs'}`
                                        : '0 apariciones · Pendiente'}
                                    </span>
                                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                      Perfil Salida: {crit.perfilSalida}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                                    {crit.label}
                                  </p>
                                </div>
                              </div>

                              {/* SdAs Badges & Fast Link Action */}
                              <div className="flex items-center gap-2 shrink-0 md:ml-4 flex-wrap">
                                {crit.matchingSdas.map((s) => {
                                  const c = sdaColors.get(s.id);
                                  return (
                                    <button
                                      key={s.id}
                                      type="button"
                                      onClick={() => onNavigateToSda(s.id)}
                                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-transform hover:scale-105 flex items-center gap-1 ${
                                        c?.badge || 'bg-slate-100 text-slate-800 border-slate-200'
                                      }`}
                                      title={`Abrir Ficha de ${s.title}`}
                                    >
                                      <span className="material-symbols-outlined text-[14px]">link</span>
                                      <span>{s.code}</span>
                                    </button>
                                  );
                                })}

                                <button
                                  type="button"
                                  onClick={() =>
                                    setAssigningElement({
                                      type: 'criterion',
                                      id: crit.id,
                                      code: crit.code,
                                      label: crit.label,
                                      ceId: ce.id
                                    })
                                  }
                                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 text-secondary hover:bg-secondary hover:text-white border border-sky-200 transition-colors flex items-center gap-1 shadow-xs"
                                  title="Vincular este criterio a una SdA"
                                >
                                  <span className="material-symbols-outlined text-[15px]">add</span>
                                  <span>Asignar</span>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* SECTION 3: SABERES BÁSICOS POR BLOQUES TEMÁTICOS (A, B, C, D) */}
        {/* ================================================================ */}
        {(activeCategory === 'all' || activeCategory === 'saberes') && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h2 className="text-base font-bold text-slate-900">
                  3. Saberes Básicos por Bloques Oficiales (Decreto 110/2022)
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {saberesAnalysis.coveredCount} de {saberesAnalysis.totalCount} saberes cubiertos
              </span>
            </div>

            <div className="space-y-3">
              {saberesAnalysis.blocksData.map((block) => {
                const isExpanded = !!expandedNodes[block.id];

                // Filter saberes based on filterStatus & searchQuery
                const visibleSaberes = block.saberes.map((saber) => {
                  const filteredSubbloques = saber.subbloquesData.filter((sb) => {
                    if (filterStatus === 'pending' && sb.isCovered) return false;
                    if (filterStatus === 'covered' && !sb.isCovered) return false;
                    if (searchQuery) {
                      return sb.label.toLowerCase().includes(searchQuery.toLowerCase());
                    }
                    return true;
                  });

                  return {
                    ...saber,
                    subbloquesData: filteredSubbloques
                  };
                }).filter((s) => s.subbloquesData.length > 0);

                if ((searchQuery || filterStatus !== 'all') && visibleSaberes.length === 0) {
                  return null;
                }

                const blockBadgeColor =
                  block.percent === 100
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : block.percent > 0
                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200';

                return (
                  <div
                    key={block.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                  >
                    {/* Node Header (Level 1: Block) */}
                    <div
                      onClick={() => toggleNode(block.id)}
                      className="p-4 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between gap-3 border-b border-slate-200 transition-colors select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`material-symbols-outlined text-[20px] text-slate-500 transition-transform ${
                            isExpanded ? 'rotate-90 text-emerald-700 font-bold' : ''
                          }`}
                        >
                          chevron_right
                        </span>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                              {block.code}
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${blockBadgeColor}`}>
                              {block.coveredCount} de {block.totalCount} cubiertos ({block.percent}%)
                            </span>
                          </div>
                          <h3 className="text-xs md:text-sm font-bold text-slate-800 mt-1 truncate">
                            {block.label}
                          </h3>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                        {block.totalCount} contenidos
                      </span>
                    </div>

                    {/* Node Children: Saberes (Level 2) */}
                    {isExpanded && (
                      <div className="p-3 md:p-4 bg-white flex flex-col gap-4">
                        {visibleSaberes.map((saber) => (
                          <div key={saber.id} className="flex flex-col gap-2">
                            {/* Saber Category Subtitle */}
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                {saber.label}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {saber.coveredCount}/{saber.totalCount} incluidos
                              </span>
                            </div>

                            {/* Subbloque Items (Level 3) */}
                            <div className="space-y-2">
                              {saber.subbloquesData.map((sb, sbIdx) => (
                                <div
                                  key={sbIdx}
                                  className={`p-3 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                                    sb.isCovered
                                      ? 'bg-slate-50/70 border-slate-200 hover:border-secondary/40'
                                      : 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                                  }`}
                                >
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    {sb.isCovered ? (
                                      <span
                                        className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5"
                                        title="Saber incluido en la programación"
                                      >
                                        check_circle
                                      </span>
                                    ) : (
                                      <span
                                        className="material-symbols-outlined text-amber-500 text-[18px] shrink-0 mt-0.5 animate-pulse"
                                        title="Saber básico pendiente de programar"
                                      >
                                        radio_button_unchecked
                                      </span>
                                    )}

                                    <div className="flex flex-col min-w-0">
                                      <span className="text-xs text-slate-800 font-medium leading-relaxed">
                                        {sb.label}
                                      </span>
                                      <span className="text-[11px] text-slate-500 mt-0.5">
                                        {sb.count > 0
                                          ? `Trabajado en ${sb.count} ${sb.count === 1 ? 'SdA' : 'SdAs'}`
                                          : 'Sin asignar a ninguna SdA'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* SdA Badges & Fast Action */}
                                  <div className="flex items-center gap-2 shrink-0 md:ml-4 flex-wrap">
                                    {sb.matchingSdas.map((s) => {
                                      const c = sdaColors.get(s.id);
                                      return (
                                        <button
                                          key={s.id}
                                          type="button"
                                          onClick={() => onNavigateToSda(s.id)}
                                          className={`text-xs font-bold px-2 py-0.5 rounded-lg border transition-transform hover:scale-105 flex items-center gap-1 ${
                                            c?.badge || 'bg-slate-100 text-slate-800'
                                          }`}
                                          title={`Abrir Ficha de ${s.title}`}
                                        >
                                          <span className="material-symbols-outlined text-[13px]">link</span>
                                          <span>{s.code}</span>
                                        </button>
                                      );
                                    })}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setAssigningElement({
                                          type: 'saber',
                                          id: `${block.id}-${saber.id}-${sbIdx}`,
                                          code: block.code,
                                          label: sb.label
                                        })
                                      }
                                      className="text-xs font-semibold px-2 py-1 rounded-lg bg-sky-50 text-secondary hover:bg-secondary hover:text-white border border-sky-200 transition-colors flex items-center gap-1 shadow-xs"
                                      title="Vincular este saber básico a una SdA"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">add</span>
                                      <span>Asignar</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Assignment Modal (when clicking "+ Asignar") */}
      {assigningElement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl animate-in zoom-in-95 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">assignment_turned_in</span>
                <h3 className="font-bold text-sm text-slate-900">
                  {assigningElement.type === 'competencia'
                    ? `Vincular Competencia ${assigningElement.code}`
                    : assigningElement.type === 'criterion'
                    ? `Vincular Criterio ${assigningElement.code}`
                    : 'Vincular Saber Básico'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssigningElement(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 line-clamp-3">
              {assigningElement.label}
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">
                Selecciona a qué Situación de Aprendizaje deseas incorporarlo:
              </label>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {sdas.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleAssignToSda(s.id)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-secondary hover:bg-sky-50/70 transition-all text-left flex items-center justify-between group"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-secondary">
                        {s.code}: {s.title}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {s.quarter}.º Trimestre · {s.totalSessions} sesiones
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-secondary shrink-0">
                      add_circle
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setAssigningElement(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
