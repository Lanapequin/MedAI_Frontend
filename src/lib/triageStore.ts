// Store simple para persistir clasificaciones de triage en localStorage
import { TriageResponse, TriageFormData } from '@/types/triage';

export interface TriageRecord {
  id: string;
  timestamp: string;
  paciente: {
    edad: number;
    sexo: 'M' | 'F';
    motivo_consulta: string;
  };
  resultado: TriageResponse;
  formData: TriageFormData;
}

export interface DashboardStats {
  totalHoy: number;
  totalSemana: number;
  porNivel: Record<number, number>;
  tiempoPromedioAtencion: number;
  pacientesEnEspera: number;
  tendenciaHoras: { hora: string; cantidad: number }[];
}

const STORAGE_KEY = 'triage_records';

// Obtener todos los registros
export function getTriageRecords(): TriageRecord[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Guardar un nuevo registro
export function saveTriageRecord(
  formData: TriageFormData,
  resultado: TriageResponse
): TriageRecord {
  const records = getTriageRecords();
  
  const newRecord: TriageRecord = {
    id: resultado.id_clasificacion || `TRIAGE-${Date.now()}`,
    timestamp: resultado.timestamp,
    paciente: {
      edad: formData.edad,
      sexo: formData.sexo,
      motivo_consulta: formData.motivo_consulta,
    },
    resultado,
    formData,
  };
  
  records.unshift(newRecord); // Agregar al inicio
  
  // Mantener solo los últimos 100 registros
  const trimmedRecords = records.slice(0, 100);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedRecords));
  
  return newRecord;
}

// Obtener estadísticas para el dashboard
export function getDashboardStats(): DashboardStats {
  const records = getTriageRecords();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  
  // Filtrar por fecha
  const todayRecords = records.filter(r => new Date(r.timestamp) >= todayStart);
  const weekRecords = records.filter(r => new Date(r.timestamp) >= weekStart);
  
  // Contar por nivel (5 niveles)
  const porNivel: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  todayRecords.forEach(r => {
    const nivel = r.resultado.nivel_recomendado;
    if (nivel >= 1 && nivel <= 5) {
      porNivel[nivel]++;
    }
  });
  
  // Tendencia por hora (últimas 12 horas)
  const tendenciaHoras: { hora: string; cantidad: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const horaStart = new Date(now);
    horaStart.setHours(now.getHours() - i, 0, 0, 0);
    const horaEnd = new Date(horaStart);
    horaEnd.setHours(horaEnd.getHours() + 1);
    
    const cantidad = records.filter(r => {
      const t = new Date(r.timestamp);
      return t >= horaStart && t < horaEnd;
    }).length;
    
    tendenciaHoras.push({
      hora: horaStart.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      cantidad,
    });
  }
  
  // Simular pacientes en espera (basado en clasificaciones recientes de nivel 1-2)
  const pacientesEnEspera = todayRecords.filter(
    r => r.resultado.nivel_recomendado <= 2
  ).length;
  
  return {
    totalHoy: todayRecords.length,
    totalSemana: weekRecords.length,
    porNivel,
    tiempoPromedioAtencion: 15 + Math.floor(Math.random() * 10), // Simulado
    pacientesEnEspera: Math.max(0, pacientesEnEspera - Math.floor(pacientesEnEspera * 0.7)),
    tendenciaHoras,
  };
}

// Generar datos de demostración
export function generateDemoData(): void {
  const records = getTriageRecords();
  if (records.length > 0) return; // Ya hay datos
  
  const motivos = [
    'Dolor abdominal intenso',
    'Fiebre alta y malestar general',
    'Dificultad respiratoria',
    'Dolor en el pecho',
    'Trauma por caída',
    'Cefalea intensa',
    'Náuseas y vómitos',
    'Dolor lumbar',
    'Mareos y debilidad',
    'Tos persistente',
  ];
  
  const areas = [
    'Sala de Reanimación',
    'Sala de Urgencias - Área Crítica',
    'Sala de Urgencias - Observación',
    'Consulta Prioritaria',
    'Sala de Espera General / Consulta Externa',
  ];
  
  const tiempos = [
    'Inmediato',
    'Menos de 10 minutos',
    'Menos de 30 minutos',
    'Menos de 60 minutos',
    'Menos de 120 minutos',
  ];
  
  // Generar 20 registros de las últimas 24 horas
  const demoRecords: TriageRecord[] = [];
  
  for (let i = 0; i < 20; i++) {
    const horasAtras = Math.random() * 24;
    const timestamp = new Date(Date.now() - horasAtras * 60 * 60 * 1000);
    const nivel = Math.random() < 0.05 ? 1 : Math.random() < 0.15 ? 2 : Math.random() < 0.4 ? 3 : Math.random() < 0.7 ? 4 : 5;
    const edad = Math.floor(Math.random() * 80) + 1;
    const sexo: 'M' | 'F' = Math.random() > 0.5 ? 'M' : 'F';
    
    const record: TriageRecord = {
      id: `DEMO-${Date.now()}-${i}`,
      timestamp: timestamp.toISOString(),
      paciente: {
        edad,
        sexo,
        motivo_consulta: motivos[Math.floor(Math.random() * motivos.length)],
      },
      resultado: {
        nivel_recomendado: nivel as 1 | 2 | 3 | 4 | 5,
        nivel_nombre: ['Resucitación', 'Emergencia', 'Urgencia', 'Menos Urgente', 'No Urgente'][nivel - 1],
        descripcion: `Paciente clasificado como nivel ${nivel}`,
        probabilidades: [
          { nivel: 1, probabilidad: nivel === 1 ? 75 : 5, color: '#E53E3E', descripcion: 'Resucitación' },
          { nivel: 2, probabilidad: nivel === 2 ? 70 : 10, color: '#ED8936', descripcion: 'Emergencia' },
          { nivel: 3, probabilidad: nivel === 3 ? 65 : 15, color: '#ECC94B', descripcion: 'Urgencia' },
          { nivel: 4, probabilidad: nivel === 4 ? 60 : 10, color: '#48BB78', descripcion: 'Menos Urgente' },
          { nivel: 5, probabilidad: nivel === 5 ? 55 : 5, color: '#3182CE', descripcion: 'No Urgente' },
        ],
        factores_shap: [],
        factores_riesgo: [],
        confianza: 0.75 + Math.random() * 0.2,
        tiempo_atencion_recomendado: tiempos[nivel - 1],
        area_recomendada: areas[nivel - 1],
        timestamp: timestamp.toISOString(),
        id_clasificacion: `DEMO-${Date.now()}-${i}`,
      },
      formData: {
        edad,
        sexo,
        modo_llegada: 'Caminando',
        motivo_consulta: motivos[Math.floor(Math.random() * motivos.length)],
        frecuencia_cardiaca: 70 + Math.floor(Math.random() * 30),
        frecuencia_respiratoria: 14 + Math.floor(Math.random() * 8),
        temperatura: 36 + Math.random() * 3,
        spO2: 94 + Math.floor(Math.random() * 6),
        presion_sistolica: 110 + Math.floor(Math.random() * 40),
        presion_diastolica: 70 + Math.floor(Math.random() * 20),
        dolor: Math.floor(Math.random() * 10),
        hta: Math.random() > 0.7,
        dm2: Math.random() > 0.8,
        epoc: Math.random() > 0.9,
        irc: Math.random() > 0.95,
        cardiopatia: Math.random() > 0.85,
        obesidad: Math.random() > 0.7,
        cancer: Math.random() > 0.95,
        embarazo: sexo === 'F' && Math.random() > 0.9,
        requiere_labs: Math.random() > 0.5,
        requiere_imagenes: Math.random() > 0.6,
        es_prioritario: Math.random() > 0.8,
      },
    };
    
    demoRecords.push(record);
  }
  
  // Ordenar por timestamp descendente
  demoRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoRecords));
}

// Limpiar datos
export function clearTriageRecords(): void {
  localStorage.removeItem(STORAGE_KEY);
}
