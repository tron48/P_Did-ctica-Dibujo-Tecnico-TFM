import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table authenticated via Firebase Auth (Google Sign-In)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Teacher profile and school center data
export const teacherProfiles = pgTable('teacher_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(), // References users.uid
  name: text('name').notNull(),
  role: text('role').notNull(),
  center: text('center').notNull(),
  department: text('department').notNull(),
  subject: text('subject').notNull(),
  framework: text('framework').notNull(),
  academicYear: text('academic_year').notNull(),
  hours: text('hours').notNull(),
  avatarUrl: text('avatar_url'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Situaciones de Aprendizaje (SdAs)
export const sdas = pgTable('sdas', {
  id: text('id').primaryKey(), // e.g. sda-1, sda-1718000000000
  userId: text('user_id').notNull(),
  number: text('number').notNull(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  educationalLevel: text('educational_level').notNull(),
  timing: text('timing').notNull(),
  quarter: integer('quarter').notNull(),
  totalSessions: integer('total_sessions').notNull(),
  startDate: text('start_date'),
  endDate: text('end_date'),
  autoLinkedToPrev: boolean('auto_linked_to_prev').default(true),
  finalProduct: jsonb('final_product'),
  prototype: jsonb('prototype'),
  competenciasEspecificas: jsonb('competencias_especificas'),
  criteriosEvaluacion: jsonb('criterios_evaluacion'),
  saberesBasicos: jsonb('saberes_basicos'),
  competenciasClave: jsonb('competencias_clave'),
  dua: jsonb('dua'),
  status: text('status').default('planned'),
  orderIndex: integer('order_index').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Competency weights (%)
export const curriculumWeights = pgTable('curriculum_weights', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  ce1: integer('ce1').notNull().default(25),
  ce2: integer('ce2').notNull().default(35),
  ce3: integer('ce3').notNull().default(30),
  ce4: integer('ce4').notNull().default(10),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Students roster in the gradebook
export const students = pgTable('students', {
  id: text('id').primaryKey(), // e.g. alu-01
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  group: text('group'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Student evaluations & scores per criterion
export const studentGradeRecords = pgTable('student_grade_records', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  studentId: text('student_id').notNull(),
  studentName: text('student_name').notNull(),
  scores: jsonb('scores'), // Map criterionId -> level (1 to 4)
  notes: text('notes'),
  updatedAt: timestamp('updated_at').defaultNow(),
});
