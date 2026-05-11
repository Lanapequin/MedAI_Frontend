// Tipos para el payload de la API de Triage

export type Sexo = 'M' | 'F';

export type ModoLlegada = 
  | 'Caminando'
  | 'Particular'
  | 'Ambulancia'
  | 'Policía';

// Motivo de consulta ahora es texto libre
export type MotivoConsulta = string;

// Datos básicos del paciente
export interface DatosBasicos {
  edad: number;
  sexo: Sexo;
  modo_llegada: ModoLlegada;
  motivo_consulta: string;
}

// Signos vitales
export interface SignosVitales {
  frecuencia_cardiaca: number;
  frecuencia_respiratoria: number;
  temperatura: number;
  spO2: number;
  presion_sistolica: number;
  presion_diastolica: number;
  dolor: number;
}

// Comorbilidades
export interface Comorbilidades {
  hta: boolean;
  dm2: boolean;
  epoc: boolean;
  irc: boolean;
  cardiopatia: boolean;
  obesidad: boolean;
  cancer: boolean;
  embarazo: boolean;
}

// Solicitud diagnóstica
export interface SolicitudDiagnostica {
  requiere_labs: boolean;
  requiere_imagenes: boolean;
}

// Payload para el formulario interno (estructura plana)
export interface TriageFormData {
  // Datos básicos
  edad: number;
  sexo: Sexo;
  modo_llegada: ModoLlegada;
  motivo_consulta: string;
  
  // Signos vitales
  frecuencia_cardiaca: number;
  frecuencia_respiratoria: number;
  temperatura: number;
  spO2: number;
  presion_sistolica: number;
  presion_diastolica: number;
  dolor: number;
  
  // Comorbilidades
  hta: boolean;
  dm2: boolean;
  epoc: boolean;
  irc: boolean;
  cardiopatia: boolean;
  obesidad: boolean;
  cancer: boolean;
  embarazo: boolean;
  
  // Solicitud diagnóstica
  requiere_labs: boolean;
  requiere_imagenes: boolean;
  
  // Prioridad
  es_prioritario: boolean;
}

// Payload para la API del backend (estructura según backend real)
export interface TriageAPIPayload {
  edad: number;
  sexo: Sexo;
  modo_llegada: ModoLlegada;
  motivo_consulta: string;
  signos_vitales: SignosVitales;
  comorbilidades?: Comorbilidades;
  requiere_labs?: boolean;
  requiere_imagenes?: boolean;
  es_prioritario?: boolean;
}

// Alias para compatibilidad
export interface TriagePayload extends TriageFormData {}

// Niveles de triage (1-5)
export type NivelTriage = 1 | 2 | 3 | 4 | 5;

// Respuesta del backend
export interface FactorRiesgo {
  factor: string;
  descripcion: string;
  severidad: 'alta' | 'media' | 'baja';
}

// Real SHAP feature from backend (v2 API)
export interface SHAPFeatureAPI {
  feature: string;
  value: number;
  shap_value: number;
  direction: 'aumenta' | 'disminuye';
}

export interface BackendTriageResponse {
  nivel_triage: string;
  nivel_codigo: 1 | 2 | 3 | 4 | 5;
  descripcion: string;
  confianza: number; // percentage 0–100
  probabilidades: Record<string, number>; // { "Nivel 1": 49.8, ... } already in %
  factores_riesgo: FactorRiesgo[];
  tiempo_atencion_recomendado: string;
  area_recomendada: string;
  // SHAP fields (v2 API)
  shap_base_value?: number;
  shap_features?: SHAPFeatureAPI[];
  shap_global_importance?: Record<string, number>;
  timestamp: string;
  prediction_id?: number | null;
}

// Factor SHAP para interpretabilidad
export interface FactorSHAP {
  nombre: string;
  valor: number;
  impacto: 'positivo' | 'negativo';
  descripcion: string;
}

// Probabilidades por nivel
export interface ProbabilidadesNivel {
  nivel: NivelTriage;
  probabilidad: number;
  color: string;
  descripcion: string;
}

// Respuesta de la API de clasificación (normalizada para el frontend)
export interface TriageResponse {
  nivel_recomendado: NivelTriage;
  nivel_nombre: string;
  descripcion: string;
  probabilidades: ProbabilidadesNivel[];
  factores_shap: FactorSHAP[];
  factores_riesgo: FactorRiesgo[];
  confianza: number;
  tiempo_atencion_recomendado: string;
  area_recomendada: string;
  timestamp: string;
  id_clasificacion: string;
  // Real SHAP data from backend
  shap_base_value?: number;
  shap_features_raw?: SHAPFeatureAPI[];
  shap_global_importance?: Record<string, number>;
  prediction_id?: number | null;
}

// Configuración de colores por nivel de triage (5 niveles)
export const COLORES_TRIAGE: Record<NivelTriage, { bg: string; text: string; border: string; name: string }> = {
  1: { bg: 'red.500', text: 'white', border: 'red.700', name: 'Resucitación' },
  2: { bg: 'orange.500', text: 'white', border: 'orange.700', name: 'Emergencia' },
  3: { bg: 'yellow.400', text: 'black', border: 'yellow.600', name: 'Urgencia' },
  4: { bg: 'green.500', text: 'white', border: 'green.700', name: 'Menos Urgente' },
  5: { bg: 'blue.500', text: 'white', border: 'blue.700', name: 'No Urgente' },
};

// Rangos críticos de signos vitales
export interface RangoCritico {
  min?: number;
  max?: number;
  alerta: 'danger' | 'warning' | 'normal';
}

export const RANGOS_CRITICOS: Record<keyof SignosVitales, RangoCritico[]> = {
  frecuencia_cardiaca: [
    { max: 50, alerta: 'danger' },
    { min: 51, max: 59, alerta: 'warning' },
    { min: 60, max: 100, alerta: 'normal' },
    { min: 101, max: 120, alerta: 'warning' },
    { min: 121, alerta: 'danger' },
  ],
  frecuencia_respiratoria: [
    { max: 10, alerta: 'danger' },
    { min: 11, max: 11, alerta: 'warning' },
    { min: 12, max: 20, alerta: 'normal' },
    { min: 21, max: 24, alerta: 'warning' },
    { min: 25, alerta: 'danger' },
  ],
  temperatura: [
    { max: 35, alerta: 'danger' },
    { min: 35.1, max: 36.4, alerta: 'warning' },
    { min: 36.5, max: 37.5, alerta: 'normal' },
    { min: 37.6, max: 38.4, alerta: 'warning' },
    { min: 38.5, alerta: 'danger' },
  ],
  spO2: [
    { max: 89, alerta: 'danger' },
    { min: 90, max: 93, alerta: 'warning' },
    { min: 94, alerta: 'normal' },
  ],
  presion_sistolica: [
    { max: 89, alerta: 'danger' },
    { min: 90, max: 99, alerta: 'warning' },
    { min: 100, max: 139, alerta: 'normal' },
    { min: 140, max: 179, alerta: 'warning' },
    { min: 180, alerta: 'danger' },
  ],
  presion_diastolica: [
    { max: 59, alerta: 'danger' },
    { min: 60, max: 89, alerta: 'normal' },
    { min: 90, max: 109, alerta: 'warning' },
    { min: 110, alerta: 'danger' },
  ],
  dolor: [
    { min: 0, max: 3, alerta: 'normal' },
    { min: 4, max: 6, alerta: 'warning' },
    { min: 7, alerta: 'danger' },
  ],
};
