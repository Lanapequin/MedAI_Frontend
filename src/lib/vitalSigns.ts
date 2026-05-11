import { SignosVitales, RANGOS_CRITICOS, RangoCritico } from '@/types/triage';

export type AlertLevel = 'danger' | 'warning' | 'normal';

export interface VitalSignAlert {
  field: keyof SignosVitales;
  value: number;
  level: AlertLevel;
  message: string;
}

/**
 * Obtiene el nivel de alerta para un valor de signo vital específico
 */
export function getVitalSignAlertLevel(
  field: keyof SignosVitales,
  value: number
): AlertLevel {
  const rangos = RANGOS_CRITICOS[field];
  
  for (const rango of rangos) {
    const minOk = rango.min === undefined || value >= rango.min;
    const maxOk = rango.max === undefined || value <= rango.max;
    
    if (minOk && maxOk) {
      return rango.alerta;
    }
  }
  
  return 'normal';
}

/**
 * Obtiene el color de Chakra UI según el nivel de alerta
 */
export function getAlertColor(level: AlertLevel): {
  borderColor: string;
  bgColor: string;
  textColor: string;
} {
  switch (level) {
    case 'danger':
      return {
        borderColor: 'red.500',
        bgColor: 'red.50',
        textColor: 'red.700',
      };
    case 'warning':
      return {
        borderColor: 'orange.400',
        bgColor: 'orange.50',
        textColor: 'orange.700',
      };
    default:
      return {
        borderColor: 'gray.200',
        bgColor: 'white',
        textColor: 'gray.700',
      };
  }
}

/**
 * Mensajes de alerta para cada signo vital según su nivel
 */
const ALERT_MESSAGES: Record<keyof SignosVitales, Record<AlertLevel, string>> = {
  frecuencia_cardiaca: {
    danger: '⚠️ Frecuencia cardíaca crítica',
    warning: '⚡ Frecuencia cardíaca fuera de rango normal',
    normal: '',
  },
  frecuencia_respiratoria: {
    danger: '⚠️ Frecuencia respiratoria crítica',
    warning: '⚡ Frecuencia respiratoria alterada',
    normal: '',
  },
  temperatura: {
    danger: '⚠️ Temperatura crítica',
    warning: '⚡ Temperatura alterada',
    normal: '',
  },
  spO2: {
    danger: '⚠️ Saturación de oxígeno crítica - Hipoxemia severa',
    warning: '⚡ Saturación de oxígeno baja',
    normal: '',
  },
  presion_sistolica: {
    danger: '⚠️ Presión sistólica crítica',
    warning: '⚡ Presión sistólica alterada',
    normal: '',
  },
  presion_diastolica: {
    danger: '⚠️ Presión diastólica crítica',
    warning: '⚡ Presión diastólica alterada',
    normal: '',
  },
  dolor: {
    danger: '⚠️ Dolor severo',
    warning: '⚡ Dolor moderado',
    normal: '',
  },
};

/**
 * Obtiene el mensaje de alerta para un signo vital
 */
export function getAlertMessage(
  field: keyof SignosVitales,
  level: AlertLevel
): string {
  return ALERT_MESSAGES[field][level];
}

/**
 * Valida todos los signos vitales y retorna las alertas
 */
export function validateVitalSigns(vitals: Partial<SignosVitales>): VitalSignAlert[] {
  const alerts: VitalSignAlert[] = [];
  
  (Object.keys(vitals) as Array<keyof SignosVitales>).forEach((field) => {
    const value = vitals[field];
    if (value !== undefined && value !== null) {
      const level = getVitalSignAlertLevel(field, value);
      if (level !== 'normal') {
        alerts.push({
          field,
          value,
          level,
          message: getAlertMessage(field, level),
        });
      }
    }
  });
  
  return alerts;
}

/**
 * Nombres legibles para los campos de signos vitales
 */
export const VITAL_SIGN_LABELS: Record<keyof SignosVitales, string> = {
  frecuencia_cardiaca: 'Frecuencia Cardíaca',
  frecuencia_respiratoria: 'Frecuencia Respiratoria',
  temperatura: 'Temperatura',
  spO2: 'SpO2',
  presion_sistolica: 'Presión Sistólica',
  presion_diastolica: 'Presión Diastólica',
  dolor: 'Nivel de Dolor',
};

/**
 * Unidades para los signos vitales
 */
export const VITAL_SIGN_UNITS: Record<keyof SignosVitales, string> = {
  frecuencia_cardiaca: 'lpm',
  frecuencia_respiratoria: 'rpm',
  temperatura: '°C',
  spO2: '%',
  presion_sistolica: 'mmHg',
  presion_diastolica: 'mmHg',
  dolor: '/10',
};
