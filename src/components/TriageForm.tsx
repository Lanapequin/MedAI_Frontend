'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, AlertTriangle, Loader2, Zap, Wifi, WifiOff } from 'lucide-react';
import { triageFormSchema, TriageFormSchema, defaultTriageFormValues } from '@/lib/validations';
import { TriageResponse } from '@/types/triage';
import { clasificarTriage, simularClasificacion } from '@/services/triageApi';
import {
  DatosBasicosForm,
  SignosVitalesForm,
  ComorbilidadesForm,
  SolicitudDiagnosticaForm,
} from '@/components/form';
import { ResultsView } from '@/components/results';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Variable para controlar si usar API real o simulación
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

export function TriageForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<TriageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<TriageFormSchema>({
    resolver: zodResolver(triageFormSchema) as never,
    defaultValues: defaultTriageFormValues as unknown as TriageFormSchema,
    mode: 'onSubmit',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = form;

  const onSubmit = async (data: TriageFormSchema) => {
    setIsLoading(true);
    setError(null);

    try {
      let response: TriageResponse;

      if (USE_MOCK_API) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        response = simularClasificacion(data);
      } else {
        response = await clasificarTriage(data);
      }

      setResultado(response);
    } catch (err) {
      console.error('Error al clasificar:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNuevaClasificacion = () => {
    setResultado(null);
    setError(null);
    reset(defaultTriageFormValues as unknown as TriageFormSchema);
  };

  if (resultado) {
    return (
      <ResultsView
        result={resultado}
        onReset={handleNuevaClasificacion}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Indicador de conexión mejorado */}
      <div
        className={cn(
          "rounded-xl p-4 border shadow-sm transition-all",
          USE_MOCK_API
            ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200/70"
            : "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/70"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            USE_MOCK_API ? "bg-amber-100" : "bg-emerald-100"
          )}>
            {USE_MOCK_API ? (
              <WifiOff className={cn("h-5 w-5", "text-amber-600")} />
            ) : (
              <Wifi className={cn("h-5 w-5", "text-emerald-600")} />
            )}
          </div>
          <div>
            <span
              className={cn(
                "font-semibold",
                USE_MOCK_API ? "text-amber-800" : "text-emerald-800"
              )}
            >
              {USE_MOCK_API
                ? '🧪 Modo de demostración'
                : '🔗 Backend conectado'}
            </span>
            <p className={cn(
              "text-sm",
              USE_MOCK_API ? "text-amber-600" : "text-emerald-600"
            )}>
              {USE_MOCK_API
                ? 'Los resultados son simulados para pruebas'
                : 'Conectado a http://localhost:8000'}
            </p>
          </div>
        </div>
      </div>

      {/* Secciones del formulario con cards mejoradas */}
      <div className="space-y-5">
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <DatosBasicosForm
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
          />
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <SignosVitalesForm
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
          />
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <ComorbilidadesForm
            register={register}
            watch={watch}
            setValue={setValue}
          />
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <SolicitudDiagnosticaForm
            watch={watch}
            setValue={setValue}
          />
        </div>
      </div>

      {/* Error message mejorado */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-5 border border-red-200 shadow-sm animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-red-800 font-semibold">Error de conexión</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit button mejorado */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-5 border border-gray-200 shadow-2xl rounded-2xl mt-6">
        <Button
          type="submit"
          size="lg"
          className={cn(
            "w-full py-7 text-lg font-bold rounded-xl",
            "bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700",
            "hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800",
            "shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40",
            "transition-all duration-300",
            isLoading && "opacity-90"
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Analizando datos del paciente...</span>
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <Zap className="h-6 w-6" />
              <span>Clasificar con IA</span>
              <Send className="h-5 w-5" />
            </span>
          )}
        </Button>

        {Object.keys(errors).length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3 text-red-500">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm font-medium">
              Complete todos los campos requeridos
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
