import { z } from 'zod';

export const triageFormSchema = z.object({
  // Datos básicos
  edad: z
    .number({ message: 'La edad es requerida' })
    .min(1, 'La edad debe ser mayor a 0')
    .max(120, 'La edad debe ser menor a 120 años'),
  
  sexo: z.enum(['M', 'F'], { message: 'El sexo es requerido' }),
  
  modo_llegada: z.enum(
    ['Caminando', 'Particular', 'Ambulancia', 'Policía'],
    { message: 'El modo de llegada es requerido' }
  ),
  
  motivo_consulta: z
    .string({ message: 'El motivo de consulta es requerido' })
    .min(2, 'El motivo debe tener al menos 2 caracteres')
    .max(200, 'El motivo no puede exceder 200 caracteres'),

  // Signos vitales
  frecuencia_cardiaca: z
    .number({ message: 'La frecuencia cardíaca es requerida' })
    .min(20, 'La frecuencia cardíaca debe ser mayor a 20')
    .max(250, 'La frecuencia cardíaca debe ser menor a 250'),

  frecuencia_respiratoria: z
    .number({ message: 'La frecuencia respiratoria es requerida' })
    .min(5, 'La frecuencia respiratoria debe ser mayor a 5')
    .max(60, 'La frecuencia respiratoria debe ser menor a 60'),

  temperatura: z
    .number({ message: 'La temperatura es requerida' })
    .min(30, 'La temperatura debe ser mayor a 30°C')
    .max(45, 'La temperatura debe ser menor a 45°C'),

  spO2: z
    .number({ message: 'La SpO2 es requerida' })
    .min(50, 'La SpO2 debe ser mayor a 50%')
    .max(100, 'La SpO2 debe ser menor o igual a 100%'),

  presion_sistolica: z
    .number({ message: 'La presión sistólica es requerida' })
    .min(50, 'La presión sistólica debe ser mayor a 50')
    .max(300, 'La presión sistólica debe ser menor a 300'),

  presion_diastolica: z
    .number({ message: 'La presión diastólica es requerida' })
    .min(30, 'La presión diastólica debe ser mayor a 30')
    .max(200, 'La presión diastólica debe ser menor a 200'),

  dolor: z
    .number({ message: 'El nivel de dolor es requerido' })
    .min(0, 'El dolor debe ser entre 0 y 10')
    .max(10, 'El dolor debe ser entre 0 y 10'),

  // Comorbilidades
  hta: z.boolean().default(false),
  dm2: z.boolean().default(false),
  epoc: z.boolean().default(false),
  irc: z.boolean().default(false),
  cardiopatia: z.boolean().default(false),
  obesidad: z.boolean().default(false),
  cancer: z.boolean().default(false),
  embarazo: z.boolean().default(false),

  // Solicitud diagnóstica
  requiere_labs: z.boolean().default(false),
  requiere_imagenes: z.boolean().default(false),
  
  // Prioridad
  es_prioritario: z.boolean().default(false),
});

export type TriageFormSchema = z.infer<typeof triageFormSchema>;

// Valores por defecto del formulario - completamente vacíos
// Se usa 'as any' para permitir valores iniciales vacíos que serán validados al enviar
export const defaultTriageFormValues = {
  edad: undefined as number | undefined,
  sexo: undefined as 'M' | 'F' | undefined,
  modo_llegada: undefined as 'Caminando' | 'Particular' | 'Ambulancia' | 'Policía' | undefined,
  motivo_consulta: '' as string,
  frecuencia_cardiaca: undefined as number | undefined,
  frecuencia_respiratoria: undefined as number | undefined,
  temperatura: undefined as number | undefined,
  spO2: undefined as number | undefined,
  presion_sistolica: undefined as number | undefined,
  presion_diastolica: undefined as number | undefined,
  dolor: undefined as number | undefined,
  hta: false,
  dm2: false,
  epoc: false,
  irc: false,
  cardiopatia: false,
  obesidad: false,
  cancer: false,
  embarazo: false,
  requiere_labs: false,
  requiere_imagenes: false,
  es_prioritario: false,
};
