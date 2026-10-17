import React, { useState, useMemo } from 'react';
import { SdaData, Student, StudentGradeRecord } from '../types';

interface GradebookSectionProps {
  sdas: SdaData[];
  students: Student[];
  gradeRecords: StudentGradeRecord[];
  onUpdateGradeRecords: (records: StudentGradeRecord[]) => void;
  onAddStudent: (student: Student) => void;
  onRemoveStudent: (studentId: string) => void;
  weights: { ce1: number; ce2: number; ce3: number; ce4: number };
  onShowToast: (message: string) => void;
}

export const GradebookSection: React.FC<GradebookSectionProps> = ({
  sdas,
  students,
  gradeRecords,
  onUpdateGradeRecords,
  onAddStudent,
  onRemoveStudent,
  weights,
  onShowToast
}) => {
  const [selectedSdaId, setSelectedSdaId] = useState<string>(sdas[0]?.id || 'sda-1');
  const [searchStudent, setSearchStudent] = useState('');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGroup, setNewStudentGroup] = useState('1.º Bachillerato A');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const currentSda = sdas.find((s) => s.id === selectedSdaId) || sdas[0];

  // Active criteria in this SdA
  const activeCriteria = useMemo(() => {
    if (!currentSda?.criteriosEvaluacion) return [];
    return currentSda.criteriosEvaluacion.filter((c) => c.checked !== false);
  }, [currentSda]);

  // Level definition
  const LEVEL_MAP: Record<number, { label: string; score: number; color: string; bg: string }> = {
    1: { label: 'INSUF', score: 3.5, color: 'text-red-700 border-red-300', bg: 'bg-red-50 hover:bg-red-100' },
    2: { label: 'SUF', score: 5.5, color: 'text-amber-700 border-amber-300', bg: 'bg-amber-50 hover:bg-amber-100' },
    3: { label: 'NOT', score: 7.5, color: 'text-sky-700 border-sky-300', bg: 'bg-sky-50 hover:bg-sky-100' },
    4: { label: 'SOBR', score: 9.5, color: 'text-emerald-700 border-emerald-300', bg: 'bg-emerald-50 hover:bg-emerald-100' }
  };

  // Calculate final grade for a student
  const calculateStudentFinalGrade = (record?: StudentGradeRecord): { score: number; text: string; badgeClass: string } => {
    if (!record || !activeCriteria.length) {
      return { score: 0, text: 'Sin calificar', badgeClass: 'bg-slate-100 text-slate-500' };
    }

    let totalPoints = 0;
    let gradedCount = 0;

    activeCriteria.forEach((crit) => {
      const level = record.scores[crit.id] || record.scores[crit.code];
      if (level && LEVEL_MAP[level]) {
        totalPoints += LEVEL_MAP[level].score;
        gradedCount++;
      }
    });

    if (gradedCount === 0) {
      return { score: 0, text: 'Pendiente', badgeClass: 'bg-slate-100 text-slate-500' };
    }

    const avg = Number((totalPoints / gradedCount).toFixed(1));

    if (avg >= 9) return { score: avg, text: 'Sobresaliente', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' };
    if (avg >= 7) return { score: avg, text: 'Notable', badgeClass: 'bg-sky-100 text-sky-800 border-sky-300 font-bold' };
    if (avg >= 5) return { score: avg, text: 'Suficiente / Bien', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-medium' };
    return { score: avg, text: 'Insuficiente', badgeClass: 'bg-red-100 text-red-800 border-red-300 font-bold' };
  };

  // Change a student's score on a criterion
  const handleScoreChange = (studentId: string, studentName: string, criterionId: string, level: number) => {
    const existing = gradeRecords.find((r) => r.studentId === studentId);
    let updatedRecords: StudentGradeRecord[];

    if (existing) {
      const currentLevel = existing.scores[criterionId];
      // toggle off if already set to the same
      const nextLevel = currentLevel === level ? 0 : level;
      const newScores = { ...existing.scores };
      if (nextLevel === 0) {
        delete newScores[criterionId];
      } else {
        newScores[criterionId] = nextLevel;
      }

      updatedRecords = gradeRecords.map((r) =>
        r.studentId === studentId ? { ...r, scores: newScores } : r
      );
    } else {
      updatedRecords = [
        ...gradeRecords,
        {
          studentId,
          studentName,
          scores: { [criterionId]: level }
        }
      ];
    }

    onUpdateGradeRecords(updatedRecords);
  };

  // Save student note
  const handleSaveNotes = (studentId: string, studentName: string) => {
    const existing = gradeRecords.find((r) => r.studentId === studentId);
    let updatedRecords: StudentGradeRecord[];

    if (existing) {
      updatedRecords = gradeRecords.map((r) =>
        r.studentId === studentId ? { ...r, notes: noteInput } : r
      );
    } else {
      updatedRecords = [
        ...gradeRecords,
        {
          studentId,
          studentName,
          scores: {},
          notes: noteInput
        }
      ];
    }

    onUpdateGradeRecords(updatedRecords);
    setEditingNotesId(null);
    onShowToast('Observación pedagógica guardada.');
  };

  // Add new student
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newStudent: Student = {
      id: `alu-${Date.now()}`,
      name: newStudentName.trim(),
      group: newStudentGroup.trim() || '1.º Bachillerato'
    };

    onAddStudent(newStudent);
    setNewStudentName('');
    setIsAddStudentOpen(false);
    onShowToast(`Alumno "${newStudent.name}" añadido al cuaderno de evaluación.`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Alumno',
      'Grupo',
      ...activeCriteria.map((c) => `Criterio ${c.code} (${c.title.replace(/,/g, ' ')})`),
      'Calificación Media',
      'Nivel Competencial',
      'Observaciones'
    ];

    const rows = students.map((stu) => {
      const rec = gradeRecords.find((r) => r.studentId === stu.id);
      const grade = calculateStudentFinalGrade(rec);
      const critScores = activeCriteria.map((c) => {
        const lvl = rec?.scores[c.id] || rec?.scores[c.code];
        return lvl ? `${lvl} (${LEVEL_MAP[lvl]?.label})` : '-';
      });

      return [
        `"${stu.name}"`,
        `"${stu.group || '1.º Bach'}"`,
        ...critScores,
        grade.score > 0 ? grade.score.toString() : 'Pendiente',
        `"${grade.text}"`,
        `"${(rec?.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Acta_Calificaciones_${currentSda.code.replace(/\./g, '_')}_LOMLOE.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast(`Acta oficial exportada a CSV: ${currentSda.code}`);
  };

  // Stats calculation
  const stats = useMemo(() => {
    let totalGrade = 0;
    let gradedStudents = 0;
    let passed = 0;
    let sobr = 0;
    let not = 0;
    let suf = 0;
    let ins = 0;

    students.forEach((stu) => {
      const rec = gradeRecords.find((r) => r.studentId === stu.id);
      const grade = calculateStudentFinalGrade(rec);
      if (grade.score > 0) {
        totalGrade += grade.score;
        gradedStudents++;
        if (grade.score >= 5) passed++;
        if (grade.score >= 9) sobr++;
        else if (grade.score >= 7) not++;
        else if (grade.score >= 5) suf++;
        else ins++;
      }
    });

    const average = gradedStudents > 0 ? (totalGrade / gradedStudents).toFixed(2) : '0.0';
    const passRate = gradedStudents > 0 ? Math.round((passed / gradedStudents) * 100) : 0;

    return {
      average,
      passRate,
      gradedStudents,
      totalStudents: students.length,
      sobr,
      not,
      suf,
      ins
    };
  }, [students, gradeRecords, activeCriteria]);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    (s.group && s.group.toLowerCase().includes(searchStudent.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* SdA Selector & Action Toolbar */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">assignment_turned_in</span>
            <label htmlFor="sda-gradebook-select" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              SdA a evaluar:
            </label>
          </div>
          <select
            id="sda-gradebook-select"
            value={selectedSdaId}
            onChange={(e) => setSelectedSdaId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto cursor-pointer"
          >
            {sdas.map((sda) => (
              <option key={sda.id} value={sda.id}>
                {sda.code} · {sda.title.length > 40 ? `${sda.title.slice(0, 40)}...` : sda.title} ({sda.totalSessions} ses.)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Añadir Alumno</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            title="Descargar acta en formato CSV compatible con Excel"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Exportar CSV (Excel)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Imprimir Acta</span>
          </button>
        </div>
      </div>

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nota Media SdA</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900">{stats.average}</span>
            <span className="text-xs text-slate-500">/ 10</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            {stats.gradedStudents} de {stats.totalStudents} evaluados
          </span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tasa de Aprobado</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-black ${stats.passRate >= 70 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {stats.passRate}%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            {stats.sobr + stats.not + stats.suf} alumnos aptos
          </span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col col-span-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Distribución por Niveles</span>
          <div className="grid grid-cols-4 gap-1.5 mt-1.5 text-center">
            <div className="bg-emerald-100 border border-emerald-200 rounded p-1">
              <span className="block text-xs font-black text-emerald-800">{stats.sobr}</span>
              <span className="text-[9px] font-semibold text-emerald-700">SOBR (4)</span>
            </div>
            <div className="bg-sky-100 border border-sky-200 rounded p-1">
              <span className="block text-xs font-black text-sky-800">{stats.not}</span>
              <span className="text-[9px] font-semibold text-sky-700">NOT (3)</span>
            </div>
            <div className="bg-amber-100 border border-amber-200 rounded p-1">
              <span className="block text-xs font-black text-amber-800">{stats.suf}</span>
              <span className="text-[9px] font-semibold text-amber-700">SUF (2)</span>
            </div>
            <div className="bg-red-100 border border-red-200 rounded p-1">
              <span className="block text-xs font-black text-red-800">{stats.ins}</span>
              <span className="text-[9px] font-semibold text-red-700">INSUF (1)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Criteria Legend Bar */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-sky-900">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sky-700 text-[18px]">info</span>
          <span className="font-semibold">
            {activeCriteria.length} criterios evaluables vinculados a {currentSda.code}:
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {activeCriteria.map((c) => (
            <span
              key={c.id}
              className="px-2 py-0.5 bg-white border border-sky-300 rounded text-[11px] font-mono font-bold text-sky-950 shadow-xs"
              title={`${c.code} · ${c.title}`}
            >
              Crit. {c.code}
            </span>
          ))}
        </div>
      </div>

      {/* Student Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
          search
        </span>
        <input
          type="text"
          value={searchStudent}
          onChange={(e) => setSearchStudent(e.target.value)}
          placeholder="Buscar alumno por nombre o grupo..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
        />
      </div>

      {/* Interactive Gradebook Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 w-56 sticky left-0 bg-slate-100 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                  Alumno / Grupo
                </th>
                {activeCriteria.map((crit) => (
                  <th key={crit.id} className="py-3 px-3 text-center min-w-[130px]">
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-primary font-black">Crit. {crit.code}</span>
                      <span className="text-[10px] text-slate-500 font-normal line-clamp-1 max-w-[120px] normal-case" title={crit.title}>
                        {crit.title}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 text-center w-28 bg-slate-100/90">
                  Nota / 10
                </th>
                <th className="py-3 px-4 text-center w-36">
                  Nivel LOMLOE
                </th>
                <th className="py-3 px-3 text-center w-24">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={activeCriteria.length + 4} className="py-8 text-center text-slate-500">
                    No se encontraron alumnos con ese criterio de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const record = gradeRecords.find((r) => r.studentId === student.id);
                  const finalGrade = calculateStudentFinalGrade(record);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Student info */}
                      <td className="py-3 px-4 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e2e8f0]">
                        <div className="font-semibold text-slate-900">{student.name}</div>
                        <div className="text-[11px] text-slate-500">{student.group || '1.º Bach'}</div>
                        {record?.notes && (
                          <div className="text-[10px] text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded mt-1 border border-sky-200 inline-block line-clamp-1">
                            💬 {record.notes}
                          </div>
                        )}
                      </td>

                      {/* Criteria Scoring Buttons */}
                      {activeCriteria.map((crit) => {
                        const currentLevel = record?.scores[crit.id] || record?.scores[crit.code] || 0;

                        return (
                          <td key={crit.id} className="py-3 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {[1, 2, 3, 4].map((levelNum) => {
                                const isSelected = currentLevel === levelNum;
                                const lvlInfo = LEVEL_MAP[levelNum];

                                return (
                                  <button
                                    key={levelNum}
                                    onClick={() => handleScoreChange(student.id, student.name, crit.id, levelNum)}
                                    className={`w-6 h-6 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                                      isSelected
                                        ? `${lvlInfo.color} ${lvlInfo.bg} border-current ring-1 ring-current scale-110 shadow-xs`
                                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-700'
                                    }`}
                                    title={`Nivel ${levelNum} (${lvlInfo.label}) - ${lvlInfo.score} pts`}
                                  >
                                    {levelNum}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        );
                      })}

                      {/* Final Calculated Grade */}
                      <td className="py-3 px-4 text-center font-mono font-bold bg-slate-50/50">
                        {finalGrade.score > 0 ? (
                          <span className={`text-base ${finalGrade.score >= 5 ? 'text-slate-900' : 'text-red-600'}`}>
                            {finalGrade.score}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-normal italic">--</span>
                        )}
                      </td>

                      {/* Competence Level Badge */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs border ${finalGrade.badgeClass}`}>
                          {finalGrade.text}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingNotesId(student.id);
                              setNoteInput(record?.notes || '');
                            }}
                            className="p-1 text-slate-400 hover:text-primary rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Editar observación individual"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit_note</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar al alumno ${student.name} del cuaderno?`)) {
                                onRemoveStudent(student.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Eliminar alumno"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Notes Modal */}
      {editingNotesId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
              <span>Observación Pedagógica / Feedback</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Registro formativo para el informe de evaluación y orientación DUA del alumno.
            </p>
            <textarea
              rows={4}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Ej.: Excelente rigor en el paralelismo. Requiere apoyo en la rotulación normalizada con cajetín UNE..."
              className="w-full mt-3 p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingNotesId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const student = students.find((s) => s.id === editingNotesId);
                  if (student) handleSaveNotes(student.id, student.name);
                }}
                className="px-4 py-2 text-xs font-bold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-xs cursor-pointer"
              >
                Guardar Observación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">person_add</span>
              <span>Añadir Alumno al Cuaderno</span>
            </h3>
            <form onSubmit={handleCreateStudent} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nombre completo (Apellidos, Nombre):
                </label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Ej.: Gómez Fernández, Rodrigo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Grupo / Clase:
                </label>
                <input
                  type="text"
                  value={newStudentGroup}
                  onChange={(e) => setNewStudentGroup(e.target.value)}
                  placeholder="1.º Bachillerato A"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Registrar Alumno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
