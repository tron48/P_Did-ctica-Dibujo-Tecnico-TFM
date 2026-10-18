import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  users,
  teacherProfiles,
  sdas,
  curriculumWeights,
  students,
  studentGradeRecords
} from './schema.ts';
import {
  DEFAULT_TEACHER_PROFILE,
  RAW_INITIAL_SDAS,
  INITIAL_STUDENTS,
  INITIAL_GRADE_RECORDS
} from '../data/curriculumData.ts';
import { SdaData, TeacherProfile, Student, StudentGradeRecord } from '../types/index.ts';

export async function getOrCreateUser(uid: string, email: string) {
  try {
    const result = await db
      .insert(users)
      .values({ uid, email })
      .onConflictDoUpdate({
        target: users.uid,
        set: { email }
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Database error in getOrCreateUser', { cause: error });
  }
}

// 1. Teacher Profile
export async function getTeacherProfile(userId: string): Promise<TeacherProfile | null> {
  try {
    const rows = await db
      .select()
      .from(teacherProfiles)
      .where(eq(teacherProfiles.userId, userId));

    if (!rows.length) return null;
    const r = rows[0];
    return {
      name: r.name,
      role: r.role,
      center: r.center,
      department: r.department,
      subject: r.subject,
      framework: r.framework,
      academicYear: r.academicYear,
      hours: r.hours,
      avatarUrl: r.avatarUrl || undefined
    };
  } catch (error) {
    console.error('Error in getTeacherProfile:', error);
    throw new Error('Database error fetching profile', { cause: error });
  }
}

export async function saveTeacherProfile(userId: string, profile: TeacherProfile) {
  try {
    await db
      .insert(teacherProfiles)
      .values({
        userId,
        name: profile.name,
        role: profile.role,
        center: profile.center,
        department: profile.department,
        subject: profile.subject,
        framework: profile.framework,
        academicYear: profile.academicYear,
        hours: profile.hours,
        avatarUrl: profile.avatarUrl || null
      })
      .onConflictDoUpdate({
        target: teacherProfiles.userId,
        set: {
          name: profile.name,
          role: profile.role,
          center: profile.center,
          department: profile.department,
          subject: profile.subject,
          framework: profile.framework,
          academicYear: profile.academicYear,
          hours: profile.hours,
          avatarUrl: profile.avatarUrl || null,
          updatedAt: new Date()
        }
      });
  } catch (error) {
    console.error('Error in saveTeacherProfile:', error);
    throw new Error('Database error saving profile', { cause: error });
  }
}

// 2. SdAs
export async function getSdas(userId: string): Promise<SdaData[]> {
  try {
    const rows = await db
      .select()
      .from(sdas)
      .where(eq(sdas.userId, userId))
      .orderBy(sdas.orderIndex);

    return rows.map((r) => ({
      id: r.id,
      number: r.number,
      code: r.code,
      title: r.title,
      educationalLevel: r.educationalLevel,
      timing: r.timing,
      quarter: r.quarter,
      totalSessions: r.totalSessions,
      startDate: r.startDate || undefined,
      endDate: r.endDate || undefined,
      autoLinkedToPrev: r.autoLinkedToPrev ?? true,
      finalProduct: (r.finalProduct as any) || { format: '', description: '', context: '' },
      prototype: (r.prototype as any) || { title: '', type: '', description: '', imageUrl: '' },
      competenciasEspecificas: (r.competenciasEspecificas as any) || [],
      criteriosEvaluacion: (r.criteriosEvaluacion as any) || [],
      saberesBasicos: (r.saberesBasicos as any) || [],
      competenciasClave: (r.competenciasClave as any) || [],
      dua: (r.dua as any) || { pauta1: { title: '', description: '', tags: [] }, pauta2: { title: '', description: '', tags: [] } },
      status: (r.status as any) || 'planned'
    }));
  } catch (error) {
    console.error('Error in getSdas:', error);
    throw new Error('Database error fetching SdAs', { cause: error });
  }
}

export async function saveAllSdas(userId: string, sdasList: SdaData[]) {
  try {
    // Delete existing SdAs for this user and insert updated list
    await db.delete(sdas).where(eq(sdas.userId, userId));

    if (sdasList.length > 0) {
      await db.insert(sdas).values(
        sdasList.map((s, idx) => ({
          id: s.id,
          userId,
          number: s.number,
          code: s.code,
          title: s.title,
          educationalLevel: s.educationalLevel,
          timing: s.timing,
          quarter: s.quarter,
          totalSessions: s.totalSessions,
          startDate: s.startDate || null,
          endDate: s.endDate || null,
          autoLinkedToPrev: s.autoLinkedToPrev ?? true,
          finalProduct: s.finalProduct,
          prototype: s.prototype,
          competenciasEspecificas: s.competenciasEspecificas,
          criteriosEvaluacion: s.criteriosEvaluacion,
          saberesBasicos: s.saberesBasicos,
          competenciasClave: s.competenciasClave,
          dua: s.dua,
          status: s.status || 'planned',
          orderIndex: idx,
          updatedAt: new Date()
        }))
      );
    }
  } catch (error) {
    console.error('Error in saveAllSdas:', error);
    throw new Error('Database error saving SdAs', { cause: error });
  }
}

// 3. Curriculum Weights
export async function getCurriculumWeights(userId: string) {
  try {
    const rows = await db
      .select()
      .from(curriculumWeights)
      .where(eq(curriculumWeights.userId, userId));

    if (!rows.length) return null;
    return {
      ce1: rows[0].ce1,
      ce2: rows[0].ce2,
      ce3: rows[0].ce3,
      ce4: rows[0].ce4
    };
  } catch (error) {
    console.error('Error in getCurriculumWeights:', error);
    throw new Error('Database error fetching weights', { cause: error });
  }
}

export async function saveCurriculumWeights(userId: string, weights: { ce1: number; ce2: number; ce3: number; ce4: number }) {
  try {
    await db
      .insert(curriculumWeights)
      .values({
        userId,
        ce1: weights.ce1,
        ce2: weights.ce2,
        ce3: weights.ce3,
        ce4: weights.ce4
      })
      .onConflictDoUpdate({
        target: curriculumWeights.userId,
        set: {
          ce1: weights.ce1,
          ce2: weights.ce2,
          ce3: weights.ce3,
          ce4: weights.ce4,
          updatedAt: new Date()
        }
      });
  } catch (error) {
    console.error('Error in saveCurriculumWeights:', error);
    throw new Error('Database error saving weights', { cause: error });
  }
}

// 4. Students
export async function getStudents(userId: string): Promise<Student[]> {
  try {
    const rows = await db
      .select()
      .from(students)
      .where(eq(students.userId, userId));

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      group: r.group || undefined
    }));
  } catch (error) {
    console.error('Error in getStudents:', error);
    throw new Error('Database error fetching students', { cause: error });
  }
}

export async function saveStudents(userId: string, studentsList: Student[]) {
  try {
    await db.delete(students).where(eq(students.userId, userId));
    if (studentsList.length > 0) {
      await db.insert(students).values(
        studentsList.map((stu) => ({
          id: stu.id,
          userId,
          name: stu.name,
          group: stu.group || null,
          updatedAt: new Date()
        }))
      );
    }
  } catch (error) {
    console.error('Error in saveStudents:', error);
    throw new Error('Database error saving students', { cause: error });
  }
}

// 5. Student Grade Records
export async function getStudentGradeRecords(userId: string): Promise<StudentGradeRecord[]> {
  try {
    const rows = await db
      .select()
      .from(studentGradeRecords)
      .where(eq(studentGradeRecords.userId, userId));

    return rows.map((r) => ({
      studentId: r.studentId,
      studentName: r.studentName,
      scores: (r.scores as Record<string, number>) || {},
      notes: r.notes || undefined
    }));
  } catch (error) {
    console.error('Error in getStudentGradeRecords:', error);
    throw new Error('Database error fetching grades', { cause: error });
  }
}

export async function saveStudentGradeRecords(userId: string, recordsList: StudentGradeRecord[]) {
  try {
    await db.delete(studentGradeRecords).where(eq(studentGradeRecords.userId, userId));
    if (recordsList.length > 0) {
      await db.insert(studentGradeRecords).values(
        recordsList.map((rec) => ({
          userId,
          studentId: rec.studentId,
          studentName: rec.studentName,
          scores: rec.scores,
          notes: rec.notes || null,
          updatedAt: new Date()
        }))
      );
    }
  } catch (error) {
    console.error('Error in saveStudentGradeRecords:', error);
    throw new Error('Database error saving grades', { cause: error });
  }
}

// 6. Master Sync & Seed Helper
export async function syncOrSeedAllData(userId: string) {
  let profile = await getTeacherProfile(userId);
  let sdasList = await getSdas(userId);
  let weights = await getCurriculumWeights(userId);
  let studentsList = await getStudents(userId);
  let gradesList = await getStudentGradeRecords(userId);

  // If no data exists yet for this user, seed with initial realistic data!
  if (!profile && sdasList.length === 0) {
    await saveTeacherProfile(userId, DEFAULT_TEACHER_PROFILE);
    await saveAllSdas(userId, RAW_INITIAL_SDAS);
    await saveCurriculumWeights(userId, { ce1: 25, ce2: 35, ce3: 30, ce4: 10 });
    await saveStudents(userId, INITIAL_STUDENTS);
    await saveStudentGradeRecords(userId, INITIAL_GRADE_RECORDS);

    profile = DEFAULT_TEACHER_PROFILE;
    sdasList = RAW_INITIAL_SDAS;
    weights = { ce1: 25, ce2: 35, ce3: 30, ce4: 10 };
    studentsList = INITIAL_STUDENTS;
    gradesList = INITIAL_GRADE_RECORDS;
  }

  return {
    profile: profile || DEFAULT_TEACHER_PROFILE,
    sdas: sdasList,
    weights: weights || { ce1: 25, ce2: 35, ce3: 30, ce4: 10 },
    students: studentsList,
    gradeRecords: gradesList
  };
}
