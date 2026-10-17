import { SdaData, CalendarDay } from '../types';

export const EXTREMADURA_HOLIDAYS_2027_2028: Record<string, string> = {
  // 1.er Trimestre 2027
  '2027-09-08': 'Día de Extremadura',
  '2027-10-12': 'Fiesta Nacional de España',
  '2027-11-01': 'Todos los Santos',
  '2027-12-06': 'Día de la Constitución',
  '2027-12-07': 'No lectivo (Puente Constitución)',
  '2027-12-08': 'Inmaculada Concepción',
  '2027-12-23': 'Vacaciones de Navidad',
  '2027-12-24': 'Nochebuena',
  '2027-12-25': 'Navidad',
  '2027-12-31': 'Fin de Año',

  // 2.º Trimestre 2028
  '2028-01-01': 'Año Nuevo',
  '2028-01-06': 'Epifanía del Señor (Reyes)',
  '2028-01-07': 'No lectivo (Navidad)',
  '2028-01-28': 'Día del Docente / Comunidad Escolar',
  '2028-02-03': 'San Blas (Festivo Mérida)',
  '2028-02-28': 'Lunes de Carnaval',
  '2028-02-29': 'Martes de Carnaval',

  // 3.er Trimestre 2028
  '2028-04-10': 'Lunes Santo',
  '2028-04-11': 'Martes Santo',
  '2028-04-12': 'Miércoles Santo',
  '2028-04-13': 'Jueves Santo',
  '2028-04-14': 'Viernes Santo',
  '2028-05-01': 'Fiesta del Trabajo'
};

export const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const WEEKDAYS_ES = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

/** Formats Date into YYYY-MM-DD */
export function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parses YYYY-MM-DD safely in local time */
export function parseDateStr(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

/** Checks whether a date is a DT1 teaching day (Mondays, Wednesdays, Thursdays, Fridays, 4h/week) */
export function isTeachingDay(date: Date): { isTeaching: boolean; holidayName?: string; isNoClass?: boolean } {
  const dateStr = formatDateStr(date);
  const dayOfWeek = date.getDay(); // 0: Dom, 1: Lun, 2: Mar, 3: Mié, 4: Jue, 5: Vie, 6: Sáb

  // Weekend
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { isTeaching: false, isNoClass: true };
  }

  // Check Holiday
  if (EXTREMADURA_HOLIDAYS_2027_2028[dateStr]) {
    return { isTeaching: false, holidayName: EXTREMADURA_HOLIDAYS_2027_2028[dateStr] };
  }

  // Tuesday is non-teaching for DT1 according to official 4h timetable
  if (dayOfWeek === 2) {
    return { isTeaching: false, isNoClass: true };
  }

  // DT1 class days: Lunes (1), Miércoles (3), Jueves (4), Viernes (5)
  return { isTeaching: true };
}

/** Finds the first teaching day on or after given date */
export function getFirstTeachingDayOnOrAfter(startDate: Date): Date {
  const current = new Date(startDate.getTime());
  while (!isTeachingDay(current).isTeaching) {
    current.setDate(current.getDate() + 1);
  }
  return current;
}

/** Finds the next teaching day strictly after given date */
export function getNextTeachingDayAfter(date: Date): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + 1);
  return getFirstTeachingDayOnOrAfter(next);
}

/** Calculates session dates and returns start & end dates */
export function calculateSdaSessionDates(startDateStr: string, sessionCount: number): {
  startDate: string;
  endDate: string;
  sessions: { sessionNumber: number; dateStr: string; date: Date }[];
} {
  const validSessions = Math.max(1, sessionCount);
  const start = getFirstTeachingDayOnOrAfter(parseDateStr(startDateStr));
  const sessions: { sessionNumber: number; dateStr: string; date: Date }[] = [];

  const current = new Date(start.getTime());
  while (sessions.length < validSessions) {
    const check = isTeachingDay(current);
    if (check.isTeaching) {
      sessions.push({
        sessionNumber: sessions.length + 1,
        dateStr: formatDateStr(current),
        date: new Date(current.getTime())
      });
    }
    if (sessions.length < validSessions) {
      current.setDate(current.getDate() + 1);
    }
  }

  const lastSessionDate = sessions[sessions.length - 1].date;

  return {
    startDate: formatDateStr(start),
    endDate: formatDateStr(lastSessionDate),
    sessions
  };
}

/** Pretty human date label (e.g. 15 Sep 2027) */
export function formatHumanDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const monthAbbr = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ][m - 1];
  return `${d} ${monthAbbr} ${y}`;
}

/** Determines quarter (1, 2, 3) from date string */
export function getQuarterFromDate(dateStr: string): number {
  if (!dateStr) return 1;
  const month = Number(dateStr.split('-')[1]);
  if (month >= 9 && month <= 12) return 1;
  if (month >= 1 && month <= 3) return 2;
  return 3;
}

/**
 * Cascades/ripples the schedule across all SDAs in chronological order:
 * - SDA 01 starts at its specified date and occupies its totalSessions.
 * - SDA 02 (and subsequent) starts by default the day after the previous SDA finishes.
 * - Changing totalSessions or startDate on any SDA automatically shifts subsequent SDAs!
 */
export function cascadeAllSdas(sdas: SdaData[]): SdaData[] {
  if (!sdas || sdas.length === 0) return [];

  const result: SdaData[] = [];

  for (let i = 0; i < sdas.length; i++) {
    const current = { ...sdas[i] };
    const sessions = Math.max(1, current.totalSessions || 16);

    let startStr = current.startDate;

    // If it's the first SDA and has no startDate, default to start of school year (15 Sep 2027)
    if (i === 0) {
      if (!startStr) {
        startStr = '2027-09-15';
      }
    } else {
      const prevSda = result[i - 1];
      // If auto-linked (default is true), start on next teaching day after previous SDA finishes
      if (current.autoLinkedToPrev !== false && prevSda && prevSda.endDate) {
        const nextDate = getNextTeachingDayAfter(parseDateStr(prevSda.endDate));
        startStr = formatDateStr(nextDate);
      } else if (!startStr) {
        // Fallback if not specified
        const nextDate = prevSda?.endDate ? getNextTeachingDayAfter(parseDateStr(prevSda.endDate)) : parseDateStr('2028-01-10');
        startStr = formatDateStr(nextDate);
      }
    }

    // Calculate dates
    const schedule = calculateSdaSessionDates(startStr, sessions);
    current.startDate = schedule.startDate;
    current.endDate = schedule.endDate;
    current.quarter = getQuarterFromDate(schedule.startDate);
    current.timing = `${sessions} ses. (${formatHumanDate(schedule.startDate)} a ${formatHumanDate(schedule.endDate)})`;

    result.push(current);
  }

  return result;
}

/** Map of all scheduled sessions: dateStr -> { sdaNumber, sdaTitle, sessionLabel, sdaColor, sdaId } */
export function buildSessionsScheduleMap(sdas: SdaData[]): Map<string, {
  sdaNumber: string;
  sdaCode: string;
  sdaTitle: string;
  sessionNumber: number;
  sessionLabel: string;
  sdaId: string;
  saType: string;
  saColor: string;
}> {
  const map = new Map();

  const colors = [
    '#006398', // SDA 01: Deep blue
    '#0284c7', // SDA 02: Sky/Secondary
    '#059669', // SDA 03: Emerald
    '#7c3aed', // SDA 04: Violet
    '#d97706'  // SDA 05: Amber
  ];

  sdas.forEach((sda, idx) => {
    if (!sda.startDate || !sda.totalSessions) return;
    const schedule = calculateSdaSessionDates(sda.startDate, sda.totalSessions);
    const color = colors[idx % colors.length];

    schedule.sessions.forEach((s) => {
      map.set(s.dateStr, {
        sdaNumber: sda.number,
        sdaCode: sda.code,
        sdaTitle: sda.title,
        sessionNumber: s.sessionNumber,
        sessionLabel: `S${s.sessionNumber}`,
        sdaId: sda.id,
        saType: `sa${Number(sda.number) || idx + 1}`,
        saColor: color
      });
    });
  });

  return map;
}

/** Generates full CalendarDay array for a specific month */
export function generateMonthCalendar(
  year: number,
  monthIndex: number, // 0-11
  sdas: SdaData[]
): CalendarDay[] {
  const sessionMap = buildSessionsScheduleMap(sdas);
  const monthName = MONTH_NAMES_ES[monthIndex];

  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);

  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0: Dom, 1: Lun, ...
  const normalizedStart = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // 0 for Monday

  const days: CalendarDay[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  for (let i = normalizedStart - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const prevDate = new Date(year, monthIndex - 1, dayNum, 12);
    const dateStr = formatDateStr(prevDate);
    const weekdayIdx = prevDate.getDay();
    const teachingCheck = isTeachingDay(prevDate);

    days.push({
      day: dayNum,
      month: MONTH_NAMES_ES[prevDate.getMonth()],
      year: prevDate.getFullYear(),
      weekday: WEEKDAYS_ES[weekdayIdx],
      dateStr,
      isCurrentMonth: false,
      isHoliday: !!teachingCheck.holidayName,
      holidayName: teachingCheck.holidayName,
      isNoClass: teachingCheck.isNoClass
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const curDate = new Date(year, monthIndex, dayNum, 12);
    const dateStr = formatDateStr(curDate);
    const weekdayIdx = curDate.getDay();
    const teachingCheck = isTeachingDay(curDate);

    const sessionInfo = sessionMap.get(dateStr);

    days.push({
      day: dayNum,
      month: monthName,
      year,
      weekday: WEEKDAYS_ES[weekdayIdx],
      dateStr,
      isCurrentMonth: true,
      isHoliday: !!teachingCheck.holidayName,
      holidayName: teachingCheck.holidayName,
      isNoClass: teachingCheck.isNoClass,
      lessonId: sessionInfo ? `sess-${sessionInfo.sdaId}-${sessionInfo.sessionNumber}` : undefined,
      lessonLabel: sessionInfo ? sessionInfo.sessionLabel : undefined,
      saType: sessionInfo ? sessionInfo.saType : undefined,
      saTitle: sessionInfo ? `${sessionInfo.sdaNumber}: ${sessionInfo.sdaTitle}` : undefined,
      saColor: sessionInfo ? sessionInfo.saColor : undefined
    });
  }

  // Trailing next month days to complete 35 or 42 grid cells
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(year, monthIndex + 1, i, 12);
    const dateStr = formatDateStr(nextDate);
    const weekdayIdx = nextDate.getDay();
    const teachingCheck = isTeachingDay(nextDate);

    days.push({
      day: i,
      month: MONTH_NAMES_ES[nextDate.getMonth()],
      year: nextDate.getFullYear(),
      weekday: WEEKDAYS_ES[weekdayIdx],
      dateStr,
      isCurrentMonth: false,
      isHoliday: !!teachingCheck.holidayName,
      holidayName: teachingCheck.holidayName,
      isNoClass: teachingCheck.isNoClass
    });
  }

  return days;
}
