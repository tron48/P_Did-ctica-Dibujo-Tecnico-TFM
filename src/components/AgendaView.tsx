import React, { useState } from 'react';
import { SdaData, CalendarDay } from '../types';
import {
  generateMonthCalendar,
  MONTH_NAMES_ES,
  formatHumanDate,
  cascadeAllSdas
} from '../utils/calendarScheduler';

interface AgendaViewProps {
  sdas: SdaData[];
  onUpdateSdas: (updatedSdas: SdaData[]) => void;
  onNavigateToSda: (sdaId: string) => void;
  onShowToast: (message: string) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  sdas,
  onUpdateSdas,
  onNavigateToSda,
  onShowToast
}) => {
  // Academic year spans from Sep 2027 (month 8, 2027) to Jun 2028 (month 5, 2028)
  // Default to Enero 2028 (month 0, 2028) or current active Sda month
  const [currentYear, setCurrentYear] = useState<number>(2028);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(0); // 0 = Enero
  const [selectedDayInfo, setSelectedDayInfo] = useState<CalendarDay | null>(null);

  // Month navigation across 2027-2028 school year
  const handlePrevMonth = () => {
    if (currentYear === 2027 && currentMonthIndex <= 8) {
      onShowToast('Inicio del curso escolar: Septiembre 2027');
      return;
    }
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(2027);
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentYear === 2028 && currentMonthIndex >= 5) {
      onShowToast('Fin del periodo lectivo: Junio 2028');
      return;
    }
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(2028);
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  const handleSelectTrimestre = (t: number) => {
    if (t === 1) {
      setCurrentYear(2027);
      setCurrentMonthIndex(8); // Septiembre
      onShowToast('Mostrando 1.er Trimestre (Sep - Dic 2027)');
    } else if (t === 2) {
      setCurrentYear(2028);
      setCurrentMonthIndex(0); // Enero
      onShowToast('Mostrando 2.º Trimestre (Ene - Mar 2028)');
    } else {
      setCurrentYear(2028);
      setCurrentMonthIndex(3); // Abril
      onShowToast('Mostrando 3.er Trimestre (Abr - Jun 2028)');
    }
  };

  // Adjust sessions on a specific SDA and cascade dates
  const handleAdjustSessions = (sdaId: string, delta: number) => {
    const updated = sdas.map((s) => {
      if (s.id === sdaId) {
        const newCount = Math.max(1, (s.totalSessions || 16) + delta);
        return { ...s, totalSessions: newCount };
      }
      return s;
    });

    const cascaded = cascadeAllSdas(updated);
    onUpdateSdas(cascaded);

    const changedSda = cascaded.find((s) => s.id === sdaId);
    if (changedSda) {
      const action = delta > 0 ? 'añadida' : 'retirada';
      onShowToast(`1 sesión ${action} a ${changedSda.code}: fechas de las siguientes SdAs recalculadas.`);
    }
  };

  // Generate calendar days for current view
  const days = generateMonthCalendar(currentYear, currentMonthIndex, sdas);

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDayInfo(day);
    if (day.holidayName) {
      onShowToast(`Festivo escolar en Extremadura: ${day.holidayName}`);
    } else if (day.lessonLabel && day.saTitle) {
      onShowToast(`${day.saTitle} · Sesión ${day.lessonLabel} programada.`);
    } else if (day.isNoClass) {
      onShowToast('Día sin clase lectiva de Dibujo Técnico I (horario 4h/semana).');
    }
  };

  const currentTrimestre = currentYear === 2027 ? 1 : currentMonthIndex <= 2 ? 2 : 3;

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Header bar */}
      <div className="px-4 md:px-6 pt-5">
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">calendar_month</span>
            <span className="font-bold text-slate-900 tracking-tight text-lg md:text-xl">
              Temporización Oficial y Calendario Escolar
            </span>
          </div>
          <span className="text-xs uppercase tracking-wider bg-sky-100 text-sky-900 px-3 py-1 rounded-full font-bold border border-sky-200">
            Curso 2027–2028 · DOE Extremadura
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Distribución de sesiones lectivas (4h/semana: L, X, J, V). Al modificar sesiones de una SdA, las siguientes se desplazan en cadena automáticamente.
        </p>
      </div>

      {/* Trimestre Selector Tabs */}
      <div className="px-4 md:px-6 mt-4">
        <div className="bg-slate-100 p-1 rounded-xl flex items-center justify-between gap-1 border border-slate-200">
          <button
            onClick={() => handleSelectTrimestre(1)}
            className={`flex-1 py-1.5 rounded-lg text-center text-xs font-bold transition-all ${
              currentTrimestre === 1
                ? 'bg-white text-secondary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            type="button"
          >
            1T <span className="text-[10px] opacity-70">· SEP-DIC 2027</span>
          </button>
          <button
            onClick={() => handleSelectTrimestre(2)}
            className={`flex-1 py-1.5 rounded-lg text-center text-xs font-bold transition-all ${
              currentTrimestre === 2
                ? 'bg-white text-secondary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            type="button"
          >
            2T <span className="text-[10px] text-secondary font-bold">· ENE-MAR 2028</span>
          </button>
          <button
            onClick={() => handleSelectTrimestre(3)}
            className={`flex-1 py-1.5 rounded-lg text-center text-xs font-bold transition-all ${
              currentTrimestre === 3
                ? 'bg-white text-secondary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            type="button"
          >
            3T <span className="text-[10px] opacity-70">· ABR-JUN 2028</span>
          </button>
        </div>
      </div>

      {/* Cascading SDAs Control Panel */}
      <div className="px-4 md:px-6 mt-4">
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/90 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">tune</span>
              <h3 className="font-bold text-slate-900 text-sm">
                Control de Sesiones y Encadenamiento de SdAs
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              ⚡ Encadenamiento automático activo
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Añade o retira sesiones con los botones <strong>[+]</strong> o <strong>[-]</strong> de cualquier SdA para ver cómo las fechas de las siguientes se recalculan en tiempo real:
          </p>

          <div className="space-y-2.5">
            {sdas.map((sda, idx) => {
              const colors = [
                { bg: 'bg-[#006398]', badge: 'bg-sky-50 text-sky-900 border-sky-200' },
                { bg: 'bg-[#0284c7]', badge: 'bg-sky-100 text-sky-900 border-sky-300' },
                { bg: 'bg-[#059669]', badge: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
                { bg: 'bg-[#7c3aed]', badge: 'bg-purple-50 text-purple-900 border-purple-200' }
              ];
              const c = colors[idx % colors.length];

              return (
                <div
                  key={sda.id}
                  className="p-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-3 h-3 rounded-full ${c.bg} shrink-0`}></span>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900">{sda.code}</span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${c.badge}`}>
                          {sda.quarter}.er Trimestre
                        </span>
                        {idx > 0 && sda.autoLinkedToPrev !== false && (
                          <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            ↳ Encadenada tras SdA {sdas[idx - 1].number}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-700 truncate max-w-md font-medium">
                        {sda.title}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Periodo: <strong>{formatHumanDate(sda.startDate || '')}</strong> &rarr; <strong>{formatHumanDate(sda.endDate || '')}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Sessions Adjustment Controls */}
                  <div className="flex items-center gap-2 ml-auto shrink-0">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleAdjustSessions(sda.id, -1)}
                        className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center transition-colors"
                        title="Quitar 1 sesión a esta SdA"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-slate-900 px-2 min-w-[50px] text-center">
                        {sda.totalSessions} ses.
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustSessions(sda.id, 1)}
                        className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center transition-colors"
                        title="Añadir 1 sesión a esta SdA"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigateToSda(sda.id)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-secondary text-xs font-semibold flex items-center gap-1"
                      title="Abrir Ficha de esta SdA"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span className="hidden sm:inline">Ficha</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Interactive Calendar Matrix */}
      <div className="px-4 md:px-6 mt-4">
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-xs border border-slate-200">
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-base md:text-lg font-bold text-slate-900">
                {MONTH_NAMES_ES[currentMonthIndex]} {currentYear}
              </span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-semibold border border-slate-200">
                L · X · J · V (4 h/sem)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handlePrevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                title="Mes anterior"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button 
                onClick={handleNextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                title="Mes siguiente"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Weekday Column Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1 text-xs text-slate-500 font-bold">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span className="text-slate-300">Sáb</span>
            <span className="text-slate-300">Dom</span>
          </div>

          {/* Calendar Grid Matrix */}
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day, idx) => {
              const isSelected = selectedDayInfo?.dateStr === day.dateStr;
              const hasLesson = !!day.lessonLabel;

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[62px] rounded-xl p-1.5 flex flex-col justify-between items-start transition-all cursor-pointer border ${
                    !day.isCurrentMonth
                      ? 'bg-slate-50/50 text-slate-300 border-slate-100'
                      : day.isHoliday
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : hasLesson
                      ? 'bg-sky-50/70 hover:bg-sky-100/70 border-sky-200 text-slate-900'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700'
                  } ${isSelected ? 'ring-2 ring-secondary' : ''}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold ${day.isHoliday ? 'text-rose-600' : 'text-slate-900'}`}>
                      {day.day}
                    </span>
                    {hasLesson && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: day.saColor || '#006398' }}
                        title={day.saTitle}
                      ></span>
                    )}
                  </div>

                  {day.holidayName && (
                    <span className="text-[9px] text-rose-700 font-bold leading-tight truncate w-full">
                      {day.holidayName}
                    </span>
                  )}

                  {hasLesson && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded text-white font-bold self-end shadow-2xs"
                      style={{ backgroundColor: day.saColor || '#006398' }}
                    >
                      {day.lessonLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Day Info Popup */}
          {selectedDayInfo && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs flex-wrap">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">event</span>
                <div>
                  <span className="font-bold text-slate-900">
                    {selectedDayInfo.day} de {selectedDayInfo.month} {selectedDayInfo.year}:
                  </span>{' '}
                  {selectedDayInfo.holidayName ? (
                    <span className="text-rose-700 font-semibold">{selectedDayInfo.holidayName} (Festivo escolar)</span>
                  ) : selectedDayInfo.lessonLabel ? (
                    <span>
                      <strong>Sesión {selectedDayInfo.lessonLabel}</strong> asignada a <em>{selectedDayInfo.saTitle}</em>
                    </span>
                  ) : selectedDayInfo.isNoClass ? (
                    <span className="text-slate-500">Día no lectivo de Dibujo Técnico I</span>
                  ) : (
                    <span className="text-slate-500">Día lectivo disponible</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayInfo(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
