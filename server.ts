import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { optionalAuth, type AuthRequest } from './src/middleware/auth.ts';
import {
  syncOrSeedAllData,
  saveTeacherProfile,
  saveAllSdas,
  saveCurriculumWeights,
  saveStudents,
  saveStudentGradeRecords,
  getOrCreateUser
} from './src/db/queries.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side initialization of Gemini client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Health & Status endpoint
app.get('/api/gemini/status', (req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(apiKey),
    model: 'gemini-3.8-flash',
    framework: 'Decreto 110/2022 de Extremadura · LOMLOE'
  });
});

// 1. Generate full SdA with Gemini AI
app.post('/api/gemini/generate-sda', async (req, res) => {
  try {
    const { topic, quarter = 1, totalSessions = 16, context = 'Extremadura' } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Debes proporcionar una temática o título de partida.' });
    }

    const systemInstruction = `Eres un catedrático y asesor técnico-pedagógico de la Consejería de Educación de la Junta de Extremadura, experto en el Decreto 110/2022 (LOMLOE) para la materia Dibujo Técnico I en 1.º de Bachillerato.
Tu objetivo es diseñar una Situación de Aprendizaje (SdA) rigurosa, motivadora y técnicamente precisa.
Debes responder ÚNICAMENTE con un objeto JSON válido según el esquema solicitado.`;

    const prompt = `Diseña una Situación de Aprendizaje completa para Dibujo Técnico I (1.º Bachillerato) sobre el siguiente tema: "${topic}".
Trimestre preferente: ${quarter}.
Número orientativo de sesiones lectivas: ${totalSessions}.
Contexto geográfico y productivo: ${context}.
Asegúrate de incluir:
- Título atractivo y técnico
- Producto final (lámina A3, plano de fabricación, dossier técnico o maqueta CAD)
- Prototipo asociado
- Competencias específicas (códigos CE.DT.1, CE.DT.2, CE.DT.3, CE.DT.4)
- Criterios de evaluación oficiales del Decreto 110/2022 (códigos 1.1, 1.2, 2.1, 3.1, 4.1...)
- Saberes básicos seleccionados
- Pautas DUA (Diseño Universal para el Aprendizaje) con estrategias de accesibilidad cognitiva y motriz.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            quarter: { type: Type.INTEGER },
            totalSessions: { type: Type.INTEGER },
            finalProduct: {
              type: Type.OBJECT,
              properties: {
                format: { type: Type.STRING },
                description: { type: Type.STRING },
                context: { type: Type.STRING }
              },
              required: ['format', 'description', 'context']
            },
            prototype: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ['title', 'type', 'description']
            },
            competenciasEspecificas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  code: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ['code', 'title']
              }
            },
            criteriosEvaluacion: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  code: { type: Type.STRING },
                  title: { type: Type.STRING }
                },
                required: ['code', 'title']
              }
            },
            saberesBasicos: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            dua: {
              type: Type.OBJECT,
              properties: {
                pauta1: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['title', 'description', 'tags']
                },
                pauta2: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['title', 'description', 'tags']
                }
              },
              required: ['pauta1', 'pauta2']
            }
          },
          required: [
            'title',
            'quarter',
            'totalSessions',
            'finalProduct',
            'prototype',
            'competenciasEspecificas',
            'criteriosEvaluacion',
            'saberesBasicos',
            'dua'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ ok: true, sda: parsed });
  } catch (error: any) {
    console.error('Error generating SdA with Gemini:', error);
    res.status(500).json({
      error: 'Error al generar la Situación de Aprendizaje con Gemini AI',
      details: error?.message || String(error)
    });
  }
});

// 2. Generate Technical Activity / Sheet with Gemini AI
app.post('/api/gemini/generate-activity', async (req, res) => {
  try {
    const { block = 'Bloque 1 · Geometría Plana', topic = 'Tangencias y Enlaces', difficulty = 'Dificultad Media' } = req.body;

    const prompt = `Actúa como docente de Dibujo Técnico I (1.º Bachillerato LOMLOE Extremadura).
Genera una propuesta de actividad técnica y lámina de trabajo sobre:
Bloque: ${block}
Tema: ${topic}
Nivel: ${difficulty}

Devuelve un JSON con:
- title: título técnico del ejercicio
- description: enunciado detallado para el alumno
- format: formato sugerido (ej. 'DIN A3 Normalizado', 'Croquis con cajetín')
- tools: instrumental técnico requerido (ej. 'Compás micrométrico, escuadra y cartabón, portaminas 2H y HB')
- scale: escala normalizada aconsejada (ej. 'Escala 1:1 o 2:1')
- stepByStep: array de 3 a 5 pasos geométricos para la resolución
- criteria: array de 2 criterios LOMLOE a evaluar`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            format: { type: Type.STRING },
            tools: { type: Type.STRING },
            scale: { type: Type.STRING },
            stepByStep: { type: Type.ARRAY, items: { type: Type.STRING } },
            criteria: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['title', 'description', 'format', 'tools', 'scale', 'stepByStep', 'criteria']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ ok: true, activity: parsed });
  } catch (error: any) {
    console.error('Error generating activity with Gemini:', error);
    res.status(500).json({
      error: 'Error al generar la actividad con Gemini AI',
      details: error?.message || String(error)
    });
  }
});

// 3. Generate Analytical Rubric Descriptors with Gemini AI
app.post('/api/gemini/generate-rubric', async (req, res) => {
  try {
    const { criterionCode = '1.1', criterionTitle = 'Trazados fundamentales y tangencias' } = req.body;

    const prompt = `Para el criterio de evaluación de Dibujo Técnico I (LOMLOE):
Código: ${criterionCode}
Descripción: ${criterionTitle}

Redacta los 4 niveles de desempeño analítico con rigor técnico:
- Nivel 1 (Insuficiente, 1-4 pts)
- Nivel 2 (Suficiente / Bien, 5-6 pts)
- Nivel 3 (Notable, 7-8 pts)
- Nivel 4 (Sobresaliente, 9-10 pts)

Devuelve JSON con las 4 descripciones claras y graduadas.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            criterionCode: { type: Type.STRING },
            level1: { type: Type.STRING, description: 'Descriptor nivel 1 Insuficiente' },
            level2: { type: Type.STRING, description: 'Descriptor nivel 2 Suficiente' },
            level3: { type: Type.STRING, description: 'Descriptor nivel 3 Notable' },
            level4: { type: Type.STRING, description: 'Descriptor nivel 4 Sobresaliente' }
          },
          required: ['criterionCode', 'level1', 'level2', 'level3', 'level4']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ ok: true, rubric: parsed });
  } catch (error: any) {
    console.error('Error generating rubric with Gemini:', error);
    res.status(500).json({
      error: 'Error al generar la rúbrica con Gemini AI',
      details: error?.message || String(error)
    });
  }
});

// 4. Audit Curriculum & Didactic Programming with Gemini AI
app.post('/api/gemini/audit-curriculum', async (req, res) => {
  try {
    const { sdas = [], profile } = req.body;

    const prompt = `Analiza la siguiente programación didáctica de Dibujo Técnico I para el curso 2027–2028 (LOMLOE Extremadura, Decreto 110/2022):
Centro: ${profile?.center || 'IES Santa Eulalia'}
Docente: ${profile?.name || 'Catedrático de Dibujo Técnico'}
Situaciones de Aprendizaje planificadas (${sdas.length}):
${sdas.map((s: any, i: number) => `- SdA ${i + 1} (${s.code}): "${s.title}", ${s.totalSessions || 16} sesiones, Trimestre ${s.quarter}. Criterios: ${(s.criteriosEvaluacion || []).filter((c: any) => c.checked).map((c: any) => c.code).join(', ')}`).join('\n')}

Emite un informe de auditoría pedagógica con:
1. Resumen de alineación con el currículo oficial
2. Puntos fuertes del diseño
3. Recomendaciones de mejora o aspectos a reforzar antes de la entrega a la Inspección Educativa
4. Verificación de inclusión DUA`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alignmentScore: { type: Type.INTEGER, description: 'Puntuación de 1 a 100' },
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            duaAssessment: { type: Type.STRING }
          },
          required: ['alignmentScore', 'summary', 'strengths', 'recommendations', 'duaAssessment']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ ok: true, audit: parsed });
  } catch (error: any) {
    console.error('Error auditing curriculum with Gemini:', error);
    res.status(500).json({
      error: 'Error al auditar la programación con Gemini AI',
      details: error?.message || String(error)
    });
  }
});

// ==========================================
// Cloud SQL (PostgreSQL) Persistence Endpoints
// ==========================================

// 1. Full Initial Sync / Seed
app.get('/api/sync', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.uid || 'teacher-norma-trazo-default';
    if (req.user?.email) {
      await getOrCreateUser(userId, req.user.email).catch((e) => console.warn('Could not register user:', e));
    }
    const data = await syncOrSeedAllData(userId);
    res.json({ ok: true, data });
  } catch (error: any) {
    console.error('Error in /api/sync:', error);
    res.status(500).json({ error: error.message || 'Error syncing data from Cloud SQL' });
  }
});

// 2. Teacher Profile
app.put('/api/profile', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.uid || 'teacher-norma-trazo-default';
    const { profile } = req.body;
    if (!profile) return res.status(400).json({ error: 'Missing profile payload' });
    const saved = await saveTeacherProfile(userId, profile);
    console.log(`[PostgreSQL] Saved profile for ${userId}: ${saved.name}`);
    res.json({ ok: true, message: 'Se ha guardado correctamente en PostgreSQL', profile: saved });
  } catch (error: any) {
    console.error('Error saving profile to PostgreSQL:', error);
    res.status(500).json({ error: error.message || 'Error saving profile to PostgreSQL' });
  }
});

// 3. Situaciones de Aprendizaje (SdAs)
app.put('/api/sdas', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.uid || 'teacher-norma-trazo-default';
    const { sdas } = req.body;
    if (!Array.isArray(sdas)) return res.status(400).json({ error: 'sdas must be an array' });
    await saveAllSdas(userId, sdas);
    res.json({ ok: true, message: 'Se ha guardado correctamente en PostgreSQL' });
  } catch (error: any) {
    console.error('Error saving sdas:', error);
    res.status(500).json({ error: error.message || 'Error saving sdas' });
  }
});

// 4. Curriculum Weights
app.put('/api/weights', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.uid || 'teacher-norma-trazo-default';
    const { weights } = req.body;
    if (!weights) return res.status(400).json({ error: 'weights payload required' });
    await saveCurriculumWeights(userId, weights);
    res.json({ ok: true, message: 'Se ha guardado correctamente en PostgreSQL' });
  } catch (error: any) {
    console.error('Error saving weights:', error);
    res.status(500).json({ error: error.message || 'Error saving weights' });
  }
});

// 5. Students
app.put('/api/students', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.uid || 'teacher-norma-trazo-default';
    const { students } = req.body;
    if (!Array.isArray(students)) return res.status(400).json({ error: 'students must be an array' });
    await saveStudents(userId, students);
    res.json({ ok: true, message: 'Se ha guardado correctamente en PostgreSQL' });
  } catch (error: any) {
    console.error('Error saving students:', error);
    res.status(500).json({ error: error.message || 'Error saving students' });
  }
});

// 6. Student Grade Records (Cuaderno)
app.put('/api/grades', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.uid || 'teacher-norma-trazo-default';
    const { gradeRecords } = req.body;
    if (!Array.isArray(gradeRecords)) return res.status(400).json({ error: 'gradeRecords must be an array' });
    await saveStudentGradeRecords(userId, gradeRecords);
    res.json({ ok: true, message: 'Se ha guardado correctamente en PostgreSQL' });
  } catch (error: any) {
    console.error('Error saving grades:', error);
    res.status(500).json({ error: error.message || 'Error saving grades' });
  }
});

// 7. Bulk Sync All (e.g. restore backup)
app.post('/api/sync/all', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.uid || 'teacher-norma-trazo-default';
    const { profile, sdas, weights, students, gradeRecords } = req.body;
    if (profile) await saveTeacherProfile(userId, profile);
    if (sdas && Array.isArray(sdas)) await saveAllSdas(userId, sdas);
    if (weights) await saveCurriculumWeights(userId, weights);
    if (students && Array.isArray(students)) await saveStudents(userId, students);
    if (gradeRecords && Array.isArray(gradeRecords)) await saveStudentGradeRecords(userId, gradeRecords);
    res.json({ ok: true, message: 'Se ha guardado correctamente en PostgreSQL' });
  } catch (error: any) {
    console.error('Error saving all data:', error);
    res.status(500).json({ error: error.message || 'Error saving all data' });
  }
});

// Setup Vite middleware in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port} with Gemini AI API enabled`);
  });
}

startServer();
