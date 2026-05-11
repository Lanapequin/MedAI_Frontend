'use client';

import { CollapsibleSection } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { FileText, ScanLine, AlertTriangle, TestTube, Scan } from 'lucide-react';
import { TriageFormSchema } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface SolicitudDiagnosticaFormProps {
  watch: UseFormWatch<TriageFormSchema>;
  setValue: UseFormSetValue<TriageFormSchema>;
}

export function SolicitudDiagnosticaForm({
  watch,
  setValue,
}: SolicitudDiagnosticaFormProps) {
  const requiereLabs = watch('requiere_labs') || false;
  const requiereImagenes = watch('requiere_imagenes') || false;
  const esPrioritario = watch('es_prioritario') || false;

  return (
    <CollapsibleSection
      title="Solicitud Diagnóstica"
      icon={<FileText className="h-5 w-5" />}
      defaultOpen={false}
    >
      <p className="text-sm text-muted-foreground mb-5">
        Indique si el paciente requiere estudios diagnósticos
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Laboratorios */}
        <label
          htmlFor="requiere_labs"
          className={cn(
            "flex flex-col items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200",
            requiereLabs
              ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-100"
              : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
          )}
        >
          <div className={cn(
            "p-4 rounded-2xl mb-3 transition-all duration-200",
            requiereLabs 
              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30" 
              : "bg-gray-100 text-gray-400"
          )}>
            <TestTube className="h-8 w-8" />
          </div>
          <span className={cn(
            "font-bold text-center mb-1",
            requiereLabs ? "text-blue-800" : "text-gray-700"
          )}>
            Laboratorios
          </span>
          <p className={cn(
            "text-xs text-center mb-4",
            requiereLabs ? "text-blue-600" : "text-muted-foreground"
          )}>
            Hemograma, química, etc.
          </p>
          <Switch
            id="requiere_labs"
            checked={requiereLabs}
            onCheckedChange={(checked) => setValue('requiere_labs', checked)}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-indigo-600"
          />
        </label>

        {/* Imágenes */}
        <label
          htmlFor="requiere_imagenes"
          className={cn(
            "flex flex-col items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200",
            requiereImagenes
              ? "border-violet-400 bg-gradient-to-br from-violet-50 to-purple-50 shadow-lg shadow-violet-100"
              : "border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/50"
          )}
        >
          <div className={cn(
            "p-4 rounded-2xl mb-3 transition-all duration-200",
            requiereImagenes 
              ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30" 
              : "bg-gray-100 text-gray-400"
          )}>
            <Scan className="h-8 w-8" />
          </div>
          <span className={cn(
            "font-bold text-center mb-1",
            requiereImagenes ? "text-violet-800" : "text-gray-700"
          )}>
            Imágenes
          </span>
          <p className={cn(
            "text-xs text-center mb-4",
            requiereImagenes ? "text-violet-600" : "text-muted-foreground"
          )}>
            Rx, TAC, ecografía, etc.
          </p>
          <Switch
            id="requiere_imagenes"
            checked={requiereImagenes}
            onCheckedChange={(checked) => setValue('requiere_imagenes', checked)}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-violet-500 data-[state=checked]:to-purple-600"
          />
        </label>

        {/* Es Prioritario */}
        <label
          htmlFor="es_prioritario"
          className={cn(
            "flex flex-col items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200",
            esPrioritario
              ? "border-red-400 bg-gradient-to-br from-red-50 to-rose-50 shadow-lg shadow-red-100"
              : "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/50"
          )}
        >
          <div className={cn(
            "p-4 rounded-2xl mb-3 transition-all duration-200 relative",
            esPrioritario 
              ? "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30" 
              : "bg-gray-100 text-gray-400"
          )}>
            <AlertTriangle className="h-8 w-8" />
            {esPrioritario && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></span>
            )}
          </div>
          <span className={cn(
            "font-bold text-center mb-1",
            esPrioritario ? "text-red-800" : "text-gray-700"
          )}>
            Prioritario
          </span>
          <p className={cn(
            "text-xs text-center mb-4",
            esPrioritario ? "text-red-600" : "text-muted-foreground"
          )}>
            Atención urgente
          </p>
          <Switch
            id="es_prioritario"
            checked={esPrioritario}
            onCheckedChange={(checked) => setValue('es_prioritario', checked)}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-500 data-[state=checked]:to-rose-600"
          />
        </label>
      </div>

      {esPrioritario && (
        <div className="mt-5 p-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
            <div>
              <p className="font-bold">Paciente marcado como PRIORITARIO</p>
              <p className="text-sm text-red-100">
                Este paciente será evaluado con prioridad en el sistema de triage
              </p>
            </div>
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
}
