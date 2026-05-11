'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CollapsibleSection } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { User, Footprints, Car, Ambulance, Shield } from 'lucide-react';
import { TriageFormSchema } from '@/lib/validations';
import { ModoLlegada } from '@/types/triage';
import { cn } from '@/lib/utils';

interface DatosBasicosFormProps {
  register: UseFormRegister<TriageFormSchema>;
  errors: FieldErrors<TriageFormSchema>;
  setValue: UseFormSetValue<TriageFormSchema>;
  watch: UseFormWatch<TriageFormSchema>;
}

const MODOS_LLEGADA: { value: ModoLlegada; icon: typeof Footprints }[] = [
  { value: 'Caminando', icon: Footprints },
  { value: 'Particular', icon: Car },
  { value: 'Ambulancia', icon: Ambulance },
  { value: 'Policía', icon: Shield },
];

export function DatosBasicosForm({
  register,
  errors,
  setValue,
  watch,
}: DatosBasicosFormProps) {
  const sexoValue = watch('sexo');
  const modoLlegadaValue = watch('modo_llegada');
  const motivoValue = watch('motivo_consulta') || '';

  return (
    <CollapsibleSection
      title="Datos del Paciente"
      icon={<User className="h-5 w-5" />}
      defaultOpen={true}
    >
      {/* Edad */}
      <div className="mb-5">
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
          Edad <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            placeholder="Ingrese la edad"
            {...register('edad', { valueAsNumber: true })}
            className="text-lg h-12 text-center font-medium max-w-32"
          />
          <span className="text-sm text-muted-foreground font-medium px-3 py-2 bg-gray-100 rounded-lg">años</span>
        </div>
        {errors.edad && (
          <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {errors.edad.message}
          </p>
        )}
      </div>

      {/* Sexo */}
      <div className="mb-5">
        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
          Sexo <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setValue('sexo', 'M')}
            className={cn(
              "flex-1 py-4 px-4 rounded-xl font-semibold text-lg transition-all duration-200",
              "border-2 shadow-sm",
              sexoValue === 'M'
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-blue-500/25"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            )}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">♂</span>
              Masculino
            </span>
          </button>
          <button
            type="button"
            onClick={() => setValue('sexo', 'F')}
            className={cn(
              "flex-1 py-4 px-4 rounded-xl font-semibold text-lg transition-all duration-200",
              "border-2 shadow-sm",
              sexoValue === 'F'
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500 shadow-pink-500/25"
                : "bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:bg-pink-50"
            )}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">♀</span>
              Femenino
            </span>
          </button>
        </div>
        {errors.sexo && (
          <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {errors.sexo.message}
          </p>
        )}
      </div>

      {/* Modo de llegada */}
      <div className="mb-5">
        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
          Modo de Llegada <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MODOS_LLEGADA.map(({ value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('modo_llegada', value)}
              className={cn(
                "py-3 px-3 rounded-xl font-medium transition-all duration-200",
                "border-2 flex flex-col items-center gap-2",
                modoLlegadaValue === value
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/25"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
              )}
            >
              <Icon className={cn(
                "h-5 w-5",
                modoLlegadaValue === value ? "text-white" : "text-gray-500"
              )} />
              <span className="text-sm">{value}</span>
            </button>
          ))}
        </div>
        {errors.modo_llegada && (
          <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {errors.modo_llegada.message}
          </p>
        )}
      </div>

      {/* Motivo de consulta */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
          Motivo de Consulta <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Textarea
            placeholder="Describa detalladamente el motivo de consulta del paciente..."
            {...register('motivo_consulta')}
            rows={4}
            maxLength={200}
            className="resize-none text-base"
          />
          <div className="absolute bottom-3 right-3">
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              motivoValue.length > 180 
                ? "bg-red-100 text-red-600" 
                : motivoValue.length > 150 
                  ? "bg-amber-100 text-amber-600"
                  : "bg-gray-100 text-gray-500"
            )}>
              {motivoValue.length}/200
            </span>
          </div>
        </div>
        {errors.motivo_consulta && (
          <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {errors.motivo_consulta.message}
          </p>
        )}
      </div>
    </CollapsibleSection>
  );
}
