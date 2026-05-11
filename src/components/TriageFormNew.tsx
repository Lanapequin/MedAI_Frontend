'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, Activity, Heart, Stethoscope, FileText, 
  AlertTriangle, Loader2, Send, RefreshCw,
  Ambulance, Footprints, Car, ShieldAlert,
  Thermometer, Wind, Droplets, Baby, FlaskConical, 
  ScanLine, Star, Scale, Ribbon
} from 'lucide-react';
import { triageFormSchema, TriageFormSchema, defaultTriageFormValues } from '@/lib/validations';
import { TriageResponse, TriageFormData } from '@/types/triage';
import { clasificarTriage, simularClasificacion } from '@/services/triageApi';
import { saveTriageRecord } from '@/lib/triageStore';
import { ResultsViewNew } from '@/components/results';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// Componente de Input para signos vitales con indicador visual
function VitalInput({ 
  label, 
  value, 
  onChange,
  min,
  max,
  step = 1,
  unit,
  icon: Icon,
  warningLow,
  warningHigh,
  criticalLow,
  criticalHigh,
  error,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  icon: typeof Activity;
  warningLow?: number;
  warningHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
  error?: string;
}) {
  const getStatus = () => {
    if (value === undefined) return 'neutral';
    if (criticalLow !== undefined && value <= criticalLow) return 'critical';
    if (criticalHigh !== undefined && value >= criticalHigh) return 'critical';
    if (warningLow !== undefined && value < warningLow) return 'warning';
    if (warningHigh !== undefined && value > warningHigh) return 'warning';
    return 'normal';
  };

  const status = getStatus();
  const statusColors = {
    neutral: 'border-gray-200 bg-gray-50',
    normal: 'border-green-300 bg-green-50',
    warning: 'border-yellow-300 bg-yellow-50',
    critical: 'border-red-300 bg-red-50',
  };

  const iconColors = {
    neutral: 'text-gray-400',
    normal: 'text-green-500',
    warning: 'text-yellow-500',
    critical: 'text-red-500',
  };

  return (
    <div className="space-y-1">
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
        statusColors[status]
      )}>
        <Icon className={cn("w-5 h-5 flex-shrink-0", iconColors[status])} />
        <div className="flex-1 min-w-0">
          <Label className="text-xs text-gray-500 block">{label}</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={value ?? ''}
              onChange={(e) => onChange(Number(e.target.value))}
              min={min}
              max={max}
              step={step}
              className="h-8 text-lg font-semibold border-0 bg-transparent p-0 focus-visible:ring-0"
              placeholder="--"
            />
            <span className="text-sm text-gray-500 flex-shrink-0">{unit}</span>
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 px-1">{error}</p>}
    </div>
  );
}

// Componente de checkbox mejorado para comorbilidades
function ComorbidityCheckbox({ 
  id, 
  label, 
  checked, 
  onChange,
  icon: Icon
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: typeof Heart;
}) {
  return (
    <label 
      htmlFor={id}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all",
        checked 
          ? "bg-teal-50 border-teal-400 text-teal-800 shadow-sm" 
          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      <div className={cn(
        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
        checked 
          ? "bg-teal-500 border-teal-500" 
          : "bg-white border-gray-300"
      )}>
        {checked && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      {Icon && <Icon className={cn("w-4 h-4", checked ? "text-teal-600" : "text-gray-400")} />}
      <span className="text-sm font-medium">{label}</span>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
    </label>
  );
}

// Componente de escala de dolor
function PainScale({ value, onChange }: { value: number | undefined; onChange: (v: number) => void }) {
  const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  const getColor = (level: number) => {
    if (level <= 3) return 'bg-green-500';
    if (level <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Sin dolor</span>
        <span>Dolor máximo</span>
      </div>
      <div className="flex gap-1">
        {levels.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={cn(
              "flex-1 h-10 rounded-md text-xs font-bold transition-all",
              value === level 
                ? cn(getColor(level), "text-white shadow-lg scale-110") 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {level}
          </button>
        ))}
      </div>
      <p className="text-center text-sm font-medium text-gray-700">
        {value !== undefined ? (
          value <= 3 ? 'Dolor leve' : value <= 6 ? 'Dolor moderado' : 'Dolor severo'
        ) : 'Seleccione nivel de dolor'}
      </p>
    </div>
  );
}

export function TriageFormNew() {
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<TriageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const form = useForm<TriageFormSchema>({
    resolver: zodResolver(triageFormSchema) as never,
    defaultValues: defaultTriageFormValues as unknown as TriageFormSchema,
    mode: 'onSubmit',
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = form;

  const onSubmit = async (data: TriageFormSchema) => {
    setIsLoading(true);
    setError(null);
    setValidationError(null);

    try {
      let response: TriageResponse;
      if (USE_MOCK_API) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        response = simularClasificacion(data);
      } else {
        response = await clasificarTriage(data);
      }

      saveTriageRecord(data as TriageFormData, response);
      setResultado(response);
    } catch (err) {
      console.error('Error al clasificar:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Fired when Zod validation fails — shows which fields are missing
  const onValidationError = (errs: typeof errors) => {
    const campos = Object.keys(errs).join(', ');
    setValidationError(`Completa los campos requeridos: ${campos}`);
    // Scroll to top so the user sees the message
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNuevaClasificacion = () => {
    setResultado(null);
    setError(null);
    reset(defaultTriageFormValues as unknown as TriageFormSchema);
  };

  const handleLimpiarFormulario = () => {
    reset(defaultTriageFormValues as unknown as TriageFormSchema);
    setError(null);
  };

  if (resultado) {
    return <ResultsViewNew result={resultado} onReset={handleNuevaClasificacion} />;
  }

  const modoLlegada = watch('modo_llegada');
  const sexo = watch('sexo');

  return (
    <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="space-y-6">
      {/* Layout de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda */}
        <div className="space-y-6">
          {/* Datos del Paciente */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-3">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Datos del Paciente
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Edad */}
              <div>
                <Label className="text-sm text-gray-600 mb-1.5 block">Edad (años) *</Label>
                <Input 
                  type="number"
                  placeholder="Ingrese la edad"
                  {...register('edad', { valueAsNumber: true })}
                  className={cn(errors.edad && "border-red-300 focus:border-red-500")}
                />
                {errors.edad && <p className="text-xs text-red-500 mt-1">{errors.edad.message}</p>}
              </div>

              {/* Sexo */}
              <div>
                <Label className="text-sm text-gray-600 mb-1.5 block">Sexo *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setValue('sexo', 'M')}
                    className={cn(
                      "py-3 px-4 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2",
                      sexo === 'M'
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    )}
                  >
                    <User className="w-4 h-4" />
                    Masculino
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('sexo', 'F')}
                    className={cn(
                      "py-3 px-4 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2",
                      sexo === 'F'
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    )}
                  >
                    <User className="w-4 h-4" />
                    Femenino
                  </button>
                </div>
                {errors.sexo && <p className="text-xs text-red-500 mt-1">{errors.sexo.message}</p>}
              </div>
            </div>
          </div>

          {/* Modo de Llegada */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-3">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Ambulance className="w-5 h-5" />
                Modo de Llegada *
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'Caminando', icon: Footprints, label: 'Caminando' },
                  { value: 'Particular', icon: Car, label: 'Vehículo Particular' },
                  { value: 'Ambulancia', icon: Ambulance, label: 'Ambulancia' },
                  { value: 'Policía', icon: ShieldAlert, label: 'Policía' },
                ].map((modo) => (
                  <button
                    key={modo.value}
                    type="button"
                    onClick={() => setValue('modo_llegada', modo.value as 'Caminando' | 'Particular' | 'Ambulancia' | 'Policía')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      modoLlegada === modo.value
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    )}
                  >
                    <modo.icon className="w-6 h-6" />
                    <span className="text-sm font-medium text-center">{modo.label}</span>
                  </button>
                ))}
              </div>
              {errors.modo_llegada && <p className="text-xs text-red-500 mt-2">{errors.modo_llegada.message}</p>}
            </div>
          </div>

          {/* Motivo de Consulta */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Motivo de Consulta *
              </h2>
            </div>
            <div className="p-5">
              <Textarea
                placeholder="Describa detalladamente el motivo de consulta del paciente..."
                {...register('motivo_consulta')}
                rows={4}
                maxLength={200}
                className={cn("resize-none", errors.motivo_consulta && "border-red-300")}
              />
              <div className="flex justify-between mt-1">
                {errors.motivo_consulta && <p className="text-xs text-red-500">{errors.motivo_consulta.message}</p>}
                <p className="text-right text-xs text-gray-400 ml-auto">
                  {(watch('motivo_consulta') || '').length}/200
                </p>
              </div>
            </div>
          </div>

          {/* Nivel de Dolor */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-3">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Escala de Dolor (EVA) *
              </h2>
            </div>
            <div className="p-5">
              <PainScale 
                value={watch('dolor')} 
                onChange={(v) => setValue('dolor', v)} 
              />
              {errors.dolor && <p className="text-xs text-red-500 mt-2">{errors.dolor.message}</p>}
            </div>
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="space-y-6">
          {/* Signos Vitales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Signos Vitales *
              </h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <VitalInput
                label="Presión Sistólica"
                value={watch('presion_sistolica')}
                onChange={(v) => setValue('presion_sistolica', v)}
                min={50}
                max={300}
                unit="mmHg"
                icon={Activity}
                warningHigh={140}
                criticalHigh={180}
                warningLow={90}
                criticalLow={80}
                error={errors.presion_sistolica?.message}
              />
              <VitalInput
                label="Presión Diastólica"
                value={watch('presion_diastolica')}
                onChange={(v) => setValue('presion_diastolica', v)}
                min={30}
                max={200}
                unit="mmHg"
                icon={Activity}
                warningHigh={90}
                criticalHigh={110}
                warningLow={60}
                criticalLow={50}
                error={errors.presion_diastolica?.message}
              />
              <VitalInput
                label="Frec. Cardíaca"
                value={watch('frecuencia_cardiaca')}
                onChange={(v) => setValue('frecuencia_cardiaca', v)}
                min={20}
                max={250}
                unit="lpm"
                icon={Heart}
                warningHigh={100}
                criticalHigh={120}
                warningLow={60}
                criticalLow={50}
                error={errors.frecuencia_cardiaca?.message}
              />
              <VitalInput
                label="Frec. Respiratoria"
                value={watch('frecuencia_respiratoria')}
                onChange={(v) => setValue('frecuencia_respiratoria', v)}
                min={5}
                max={60}
                unit="rpm"
                icon={Wind}
                warningHigh={20}
                criticalHigh={25}
                warningLow={12}
                criticalLow={10}
                error={errors.frecuencia_respiratoria?.message}
              />
              <VitalInput
                label="Temperatura"
                value={watch('temperatura')}
                onChange={(v) => setValue('temperatura', v)}
                min={30}
                max={45}
                step={0.1}
                unit="°C"
                icon={Thermometer}
                warningHigh={37.5}
                criticalHigh={39}
                warningLow={36}
                criticalLow={35}
                error={errors.temperatura?.message}
              />
              <VitalInput
                label="Saturación O₂"
                value={watch('spO2')}
                onChange={(v) => setValue('spO2', v)}
                min={50}
                max={100}
                unit="%"
                icon={Droplets}
                warningLow={94}
                criticalLow={90}
                error={errors.spO2?.message}
              />
            </div>
          </div>

          {/* Comorbilidades */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-3">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Comorbilidades
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <ComorbidityCheckbox
                  id="hta"
                  label="Hipertensión Arterial"
                  checked={watch('hta') || false}
                  onChange={(v) => setValue('hta', v)}
                  icon={Activity}
                />
                <ComorbidityCheckbox
                  id="dm2"
                  label="Diabetes Tipo 2"
                  checked={watch('dm2') || false}
                  onChange={(v) => setValue('dm2', v)}
                  icon={Droplets}
                />
                <ComorbidityCheckbox
                  id="epoc"
                  label="EPOC / Asma"
                  checked={watch('epoc') || false}
                  onChange={(v) => setValue('epoc', v)}
                  icon={Wind}
                />
                <ComorbidityCheckbox
                  id="irc"
                  label="Insuf. Renal Crónica"
                  checked={watch('irc') || false}
                  onChange={(v) => setValue('irc', v)}
                />
                <ComorbidityCheckbox
                  id="cardiopatia"
                  label="Cardiopatía"
                  checked={watch('cardiopatia') || false}
                  onChange={(v) => setValue('cardiopatia', v)}
                  icon={Heart}
                />
                <ComorbidityCheckbox
                  id="obesidad"
                  label="Obesidad"
                  checked={watch('obesidad') || false}
                  onChange={(v) => setValue('obesidad', v)}
                  icon={Scale}
                />
                <ComorbidityCheckbox
                  id="cancer"
                  label="Cáncer"
                  checked={watch('cancer') || false}
                  onChange={(v) => setValue('cancer', v)}
                  icon={Ribbon}
                />
                <ComorbidityCheckbox
                  id="embarazo"
                  label="Embarazo"
                  checked={watch('embarazo') || false}
                  onChange={(v) => setValue('embarazo', v)}
                  icon={Baby}
                />
              </div>
            </div>
          </div>

          {/* Solicitudes Diagnósticas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Solicitudes Diagnósticas
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <ComorbidityCheckbox
                  id="requiere_labs"
                  label="Requiere Laboratorios"
                  checked={watch('requiere_labs') || false}
                  onChange={(v) => setValue('requiere_labs', v)}
                  icon={FlaskConical}
                />
                <ComorbidityCheckbox
                  id="requiere_imagenes"
                  label="Requiere Imágenes"
                  checked={watch('requiere_imagenes') || false}
                  onChange={(v) => setValue('requiere_imagenes', v)}
                  icon={ScanLine}
                />
              </div>
            </div>
          </div>

          {/* Prioridad */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-700 to-teal-800 px-5 py-3">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Star className="w-5 h-5" />
                Marcadores Especiales
              </h2>
            </div>
            <div className="p-5">
              <label 
                htmlFor="es_prioritario"
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                  watch('es_prioritario')
                    ? "bg-teal-50 border-teal-400 text-teal-800" 
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
                  watch('es_prioritario')
                    ? "bg-teal-500 border-teal-500" 
                    : "bg-white border-gray-300"
                )}>
                  {watch('es_prioritario') && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="font-semibold block">Paciente Prioritario</span>
                  <span className="text-sm opacity-75">Adulto mayor, gestante, discapacidad, etc.</span>
                </div>
                <input
                  type="checkbox"
                  id="es_prioritario"
                  checked={watch('es_prioritario') || false}
                  onChange={(e) => setValue('es_prioritario', e.target.checked)}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Validation error — campos faltantes */}
      {validationError && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">Faltan campos requeridos</p>
              <p className="text-amber-700 text-sm">{validationError}</p>
            </div>
          </div>
        </div>
      )}

      {/* API / network error */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Error al clasificar</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <Button 
          type="button"
          variant="outline"
          onClick={handleLimpiarFormulario}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Limpiar Formulario
        </Button>
        
        <Button 
          type="submit"
          disabled={isLoading}
          size="lg"
          className="gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Clasificando con IA...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Realizar Clasificación de Triage
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
