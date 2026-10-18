/**
 * Client service to communicate with server-side Gemini API endpoints.
 * Never calls Gemini directly from the client; calls Express backend routes.
 */

import { SdaData, TeacherProfile } from '../types';

export interface GeminiSdaResponse {
  title: string;
  quarter: number;
  totalSessions: number;
  finalProduct: {
    format: string;
    description: string;
    context: string;
  };
  prototype: {
    title: string;
    type: string;
    description: string;
  };
  competenciasEspecificas: {
    code: string;
    title: string;
    description?: string;
  }[];
  criteriosEvaluacion: {
    code: string;
    title: string;
  }[];
  saberesBasicos: string[];
  dua: {
    pauta1: {
      title: string;
      description: string;
      tags: string[];
    };
    pauta2: {
      title: string;
      description: string;
      tags: string[];
    };
  };
}

export interface GeminiActivityResponse {
  title: string;
  description: string;
  format: string;
  tools: string;
  scale: string;
  stepByStep: string[];
  criteria: string[];
}

export interface GeminiRubricResponse {
  criterionCode: string;
  level1: string;
  level2: string;
  level3: string;
  level4: string;
}

export interface GeminiAuditResponse {
  alignmentScore: number;
  summary: string;
  strengths: string[];
  recommendations: string[];
  duaAssessment: string;
}

export const checkGeminiStatus = async (): Promise<{ status: string; hasKey: boolean; model: string }> => {
  try {
    const res = await fetch('/api/gemini/status');
    if (!res.ok) throw new Error('Status check failed');
    return await res.json();
  } catch {
    return { status: 'offline', hasKey: false, model: 'gemini-3.8-flash' };
  }
};

export const generateSdaWithGemini = async (
  topic: string,
  quarter = 1,
  totalSessions = 16,
  context = 'Extremadura'
): Promise<GeminiSdaResponse> => {
  const res = await fetch('/api/gemini/generate-sda', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, quarter, totalSessions, context })
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Error al generar la SdA con Gemini');
  }

  return data.sda;
};

export const generateActivityWithGemini = async (
  block: string,
  topic: string,
  difficulty: string
): Promise<GeminiActivityResponse> => {
  const res = await fetch('/api/gemini/generate-activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ block, topic, difficulty })
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Error al generar la lámina con Gemini');
  }

  return data.activity;
};

export const generateRubricWithGemini = async (
  criterionCode: string,
  criterionTitle: string
): Promise<GeminiRubricResponse> => {
  const res = await fetch('/api/gemini/generate-rubric', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ criterionCode, criterionTitle })
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Error al generar la rúbrica con Gemini');
  }

  return data.rubric;
};

export const auditCurriculumWithGemini = async (
  sdas: SdaData[],
  profile?: TeacherProfile
): Promise<GeminiAuditResponse> => {
  const res = await fetch('/api/gemini/audit-curriculum', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sdas, profile })
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Error al auditar la programación con Gemini');
  }

  return data.audit;
};
