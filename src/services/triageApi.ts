import {
  TriageFormData,
  TriageAPIPayload,
  TriageResponse,
  NivelTriage,
  BackendTriageResponse,
  TriagePayload,
  FactorRiesgo,
  SHAPFeatureAPI
} from '@/types/triage';

import { authFetch, logout } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Convierte los datos del formulario al formato esperado por la API
 */
function convertirAPayloadAPI(formData: TriageFormData): TriageAPIPayload {
  return {
    edad: formData.edad,
    sexo: formData.sexo,
    modo_llegada: formData.modo_llegada,
    motivo_consulta: formData.motivo_consulta,
    signos_vitales: {
      frecuencia_cardiaca: formData.frecuencia_cardiaca,
      frecuencia_respiratoria: formData.frecuencia_respiratoria,
      temperatura: formData.temperatura,
      spO2: formData.spO2,
      presion_sistolica: formData.presion_sistolica,
      presion_diastolica: formData.presion_diastolica,
      dolor: formData.dolor,
    },
    comorbilidades: {
      hta: formData.hta,
      dm2: formData.dm2,
      epoc: formData.epoc,
      irc: formData.irc,
      cardiopatia: formData.cardiopatia,
      obesidad: formData.obesidad,
      cancer: formData.cancer,
      embarazo: formData.embarazo,
    },
    requiere_labs: formData.requiere_labs,
    requiere_imagenes: formData.requiere_imagenes,
    es_prioritario: formData.es_prioritario,
  };
}

function convertirRespuestaBackend(
  backendResponse: BackendTriageResponse,
  formData: TriageFormData
): TriageResponse {
  const probabilidades = convertirProbabilidades(backendResponse.probabilidades);

  const nivelRecomendado = (
    backendResponse.nivel_codigo >= 1 && backendResponse.nivel_codigo <= 5
      ? backendResponse.nivel_codigo
      : probabilidades.reduce((p, c) => (c.probabilidad > p.probabilidad ? c : p)).nivel
  ) as NivelTriage;

  // Use real SHAP values from v2 API if present; fallback to heuristics
  let factoresShap;
  if (backendResponse.shap_features && backendResponse.shap_features.length > 0) {
    factoresShap = backendResponse.shap_features.map((f: SHAPFeatureAPI) => ({
      nombre: f.feature,
      valor: f.shap_value,
      impacto: f.shap_value >= 0 ? ('positivo' as const) : ('negativo' as const),
      descripcion: `${f.feature}: ${f.value.toFixed(2)} (SHAP: ${f.shap_value > 0 ? '+' : ''}${f.shap_value.toFixed(3)})`,
    }));
  } else {
    factoresShap = generarFactoresSHAP(formData, nivelRecomendado);
  }

  const nombresNivel: Record<NivelTriage, string> = {
    1: 'Resucitación', 2: 'Emergencia', 3: 'Urgencia', 4: 'Menos Urgente', 5: 'No Urgente',
  };

  return {
    nivel_recomendado: nivelRecomendado,
    nivel_nombre: backendResponse.nivel_triage || nombresNivel[nivelRecomendado],
    descripcion: backendResponse.descripcion,
    probabilidades,
    factores_shap: factoresShap,
    factores_riesgo: backendResponse.factores_riesgo,
    confianza: backendResponse.confianza,
    tiempo_atencion_recomendado: backendResponse.tiempo_atencion_recomendado,
    area_recomendada: backendResponse.area_recomendada,
    timestamp: backendResponse.timestamp,
    id_clasificacion: `TRIAGE-${backendResponse.prediction_id ?? Date.now()}`,
    shap_base_value: backendResponse.shap_base_value,
    shap_features_raw: backendResponse.shap_features,
    shap_global_importance: backendResponse.shap_global_importance,
    prediction_id: backendResponse.prediction_id,
  };
}

function convertirProbabilidades(probs: Record<string, number>) {
  const colores: Record<number, string> = {
    1: '#E53E3E',
    2: '#ED8936',
    3: '#ECC94B',
    4: '#48BB78',
    5: '#3182CE',
  };
  
  const descripciones: Record<number, string> = {
    1: 'Resucitación - Atención inmediata',
    2: 'Emergencia - Muy urgente',
    3: 'Urgencia - Requiere atención pronta',
    4: 'Menos urgente - Puede esperar',
    5: 'No urgente - Consulta externa',
  };

  // Buscar las claves que contienen el número del nivel (ej: "Nivel 1", "Nivel 2", etc.)
  return [1, 2, 3, 4, 5].map((nivel) => {
    // Buscar clave que contenga el nivel (ej: "Nivel 1", "nivel_1", "1", etc.)
    const key = Object.keys(probs).find(k => 
      k.includes(String(nivel)) || k === String(nivel)
    );
    // Los valores ya vienen en porcentaje desde el backend
    const probabilidad = key ? probs[key] : 0;
    
    return {
      nivel: nivel as NivelTriage,
      probabilidad: Math.round(probabilidad * 10) / 10,
      color: colores[nivel],
      descripcion: descripciones[nivel],
    };
  });
}

/**
 * Envía los datos del paciente para clasificación de triage
 */
export async function clasificarTriage(formData: TriageFormData): Promise<TriageResponse> {
  const payload = convertirAPayloadAPI(formData);
  
  console.log('Enviando payload a API:', JSON.stringify(payload, null, 2));
  
  const response = await authFetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    throw new Error('Sesión expirada. Por favor cierra sesión e inicia sesión nuevamente.');
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error de API:', response.status, errorText);
    throw new Error(`Error en la clasificación: ${response.status} - ${errorText}`);
  }

  const backendResponse: BackendTriageResponse = await response.json();
  console.log('Respuesta del backend:', backendResponse);
  
  return convertirRespuestaBackend(backendResponse, formData);
}

/**
 * Simula una respuesta de la API para desarrollo/demo
 * Esta función genera datos realistas basados en los signos vitales
 */
export function simularClasificacion(payload: TriagePayload): TriageResponse {
  // Calcular nivel basado en signos vitales críticos
  let nivelBase = 4; // Empezar en nivel medio
  
  // SpO2 crítico
  if (payload.spO2 < 90) nivelBase = 1;
  else if (payload.spO2 < 94) nivelBase = Math.min(nivelBase, 2);
  
  // Frecuencia cardíaca
  if (payload.frecuencia_cardiaca > 120 || payload.frecuencia_cardiaca < 50) {
    nivelBase = Math.min(nivelBase, 2);
  }
  
  // Presión arterial crítica
  if (payload.presion_sistolica < 90 || payload.presion_sistolica > 180) {
    nivelBase = Math.min(nivelBase, 2);
  }
  
  // Temperatura
  if (payload.temperatura > 39 || payload.temperatura < 35) {
    nivelBase = Math.min(nivelBase, 2);
  }
  
  // Dolor severo
  if (payload.dolor >= 8) nivelBase = Math.min(nivelBase, 2);
  else if (payload.dolor >= 5) nivelBase = Math.min(nivelBase, 3);
  else if (payload.dolor <= 2) nivelBase = Math.max(nivelBase, 5);
  
  // Edad extrema aumenta gravedad
  if (payload.edad > 75 || payload.edad < 2) {
    nivelBase = Math.max(1, nivelBase - 1);
  }
  
  // Comorbilidades
  const comorbilidades = [
    payload.hta, payload.dm2, payload.epoc, payload.irc,
    payload.cardiopatia, payload.obesidad, payload.cancer
  ].filter(Boolean).length;
  
  if (comorbilidades >= 3) nivelBase = Math.max(1, nivelBase - 1);
  
  const nivelFinal = Math.max(1, Math.min(5, nivelBase)) as NivelTriage;
  
  // Generar probabilidades
  const probabilidades = generarProbabilidades(nivelFinal);
  
  // Generar factores SHAP
  const factoresShap = generarFactoresSHAP(payload, nivelFinal);

  const confProb = probabilidades.find(p => p.nivel === nivelFinal)?.probabilidad ?? 85;

  // Descripciones por nivel (5 niveles)
  const descripcionesNivel: Record<NivelTriage, string> = {
    1: 'Paciente crítico que requiere atención inmediata - Riesgo vital inminente',
    2: 'Paciente con signos de alarma que requiere atención muy urgente',
    3: 'Paciente con condición urgente que requiere evaluación médica pronta',
    4: 'Paciente estable que puede esperar atención programada',
    5: 'Condición no urgente. Puede esperar o ser atendido en consulta externa.',
  };

  const tiemposAtencion: Record<NivelTriage, string> = {
    1: 'Inmediato',
    2: 'Menos de 10 minutos',
    3: 'Menos de 30 minutos',
    4: 'Menos de 60 minutos',
    5: 'Menos de 120 minutos',
  };

  const areasRecomendadas: Record<NivelTriage, string> = {
    1: 'Sala de Reanimación',
    2: 'Sala de Urgencias - Área Crítica',
    3: 'Sala de Urgencias - Observación',
    4: 'Consulta Prioritaria',
    5: 'Sala de Espera General / Consulta Externa',
  };

  const nombresNivel: Record<NivelTriage, string> = {
    1: 'Resucitación',
    2: 'Emergencia',
    3: 'Urgencia',
    4: 'Menos Urgente',
    5: 'No Urgente',
  };
  
  return {
    nivel_recomendado: nivelFinal,
    nivel_nombre: nombresNivel[nivelFinal],
    descripcion: descripcionesNivel[nivelFinal],
    probabilidades,
    factores_shap: factoresShap,
    factores_riesgo: [], // En simulación no hay factores de riesgo adicionales
    confianza: confProb, // Retorna como porcentaje 0-100
    tiempo_atencion_recomendado: tiemposAtencion[nivelFinal],
    area_recomendada: areasRecomendadas[nivelFinal],
    timestamp: new Date().toISOString(),
    id_clasificacion: `TRIAGE-${Date.now()}`,
  };
}

function generarProbabilidades(nivelPrincipal: NivelTriage) {
  const colores: Record<NivelTriage, string> = {
    1: '#E53E3E',
    2: '#ED8936',
    3: '#ECC94B',
    4: '#48BB78',
    5: '#3182CE',
  };
  
  const descripciones: Record<NivelTriage, string> = {
    1: 'Resucitación - Atención inmediata',
    2: 'Emergencia - Muy urgente',
    3: 'Urgencia - Requiere atención pronta',
    4: 'Menos urgente - Puede esperar',
    5: 'No urgente - Consulta externa',
  };
  
  // Generar probabilidades centradas en el nivel principal (5 niveles)
  const probs: number[] = [0, 0, 0, 0, 0];
  let remaining = 100;
  
  // Asignar probabilidad principal (60-85%)
  const mainProb = 60 + Math.random() * 25;
  probs[nivelPrincipal - 1] = mainProb;
  remaining -= mainProb;
  
  // Distribuir el resto en niveles adyacentes
  const adjacent = [nivelPrincipal - 2, nivelPrincipal].filter(n => n >= 0 && n < 5 && n !== nivelPrincipal - 1);
  
  adjacent.forEach((idx, i) => {
    const prob = i === 0 ? remaining * 0.5 : remaining * 0.3;
    probs[idx] = prob;
    remaining -= prob;
  });
  
  // Distribuir el resto entre los demás niveles
  const emptySlots = probs.filter(p => p === 0).length;
  if (emptySlots > 0) {
    for (let i = 0; i < 5; i++) {
      if (probs[i] === 0) {
        probs[i] = remaining / emptySlots;
      }
    }
  }
  
  return [1, 2, 3, 4, 5].map((nivel) => ({
    nivel: nivel as NivelTriage,
    probabilidad: Math.round(probs[nivel - 1]),
    color: colores[nivel as NivelTriage],
    descripcion: descripciones[nivel as NivelTriage],
  }));
}

function generarFactoresSHAP(payload: TriagePayload, nivel: NivelTriage) {
  const factores = [];
  
  // SpO2
  if (payload.spO2 < 94) {
    factores.push({
      nombre: 'SpO2',
      valor: -0.8 - Math.random() * 0.3,
      impacto: 'negativo' as const,
      descripcion: `Saturación de oxígeno baja (${payload.spO2}%) aumenta la gravedad`,
    });
  }
  
  // Frecuencia cardíaca
  if (payload.frecuencia_cardiaca > 100 || payload.frecuencia_cardiaca < 60) {
    factores.push({
      nombre: 'Frecuencia Cardíaca',
      valor: payload.frecuencia_cardiaca > 100 ? -0.5 : -0.3,
      impacto: 'negativo' as const,
      descripcion: `FC de ${payload.frecuencia_cardiaca} lpm ${payload.frecuencia_cardiaca > 100 ? 'elevada' : 'baja'}`,
    });
  }
  
  // Presión arterial
  if (payload.presion_sistolica > 140 || payload.presion_sistolica < 100) {
    factores.push({
      nombre: 'Presión Sistólica',
      valor: -0.4 - Math.random() * 0.2,
      impacto: 'negativo' as const,
      descripcion: `PA sistólica de ${payload.presion_sistolica} mmHg fuera de rango`,
    });
  }
  
  // Dolor
  if (payload.dolor >= 5) {
    factores.push({
      nombre: 'Nivel de Dolor',
      valor: -0.3 - (payload.dolor / 10) * 0.4,
      impacto: 'negativo' as const,
      descripcion: `Dolor ${payload.dolor}/10 contribuye a mayor urgencia`,
    });
  }
  
  // Edad
  if (payload.edad > 65 || payload.edad < 5) {
    factores.push({
      nombre: 'Edad',
      valor: -0.25,
      impacto: 'negativo' as const,
      descripcion: `Edad de ${payload.edad} años (población vulnerable)`,
    });
  }
  
  // Comorbilidades
  const numComorbilidades = [
    payload.hta, payload.dm2, payload.epoc, payload.irc,
    payload.cardiopatia, payload.obesidad, payload.cancer
  ].filter(Boolean).length;
  
  if (numComorbilidades > 0) {
    factores.push({
      nombre: 'Comorbilidades',
      valor: -0.15 * numComorbilidades,
      impacto: 'negativo' as const,
      descripcion: `${numComorbilidades} comorbilidad(es) presente(s)`,
    });
  }
  
  // Si no hay factores negativos significativos, agregar positivos
  if (factores.length < 3) {
    if (payload.spO2 >= 95) {
      factores.push({
        nombre: 'SpO2',
        valor: 0.3,
        impacto: 'positivo' as const,
        descripcion: `Buena saturación de oxígeno (${payload.spO2}%)`,
      });
    }
    if (payload.frecuencia_cardiaca >= 60 && payload.frecuencia_cardiaca <= 100) {
      factores.push({
        nombre: 'Frecuencia Cardíaca',
        valor: 0.2,
        impacto: 'positivo' as const,
        descripcion: 'Frecuencia cardíaca normal',
      });
    }
  }
  
  // Ordenar por valor absoluto y tomar los 5 más importantes
  return factores
    .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
    .slice(0, 5);
}
