'use client';

import { Input } from '@/components/ui/input';
import { CollapsibleSection } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Activity, AlertTriangle, Heart, Wind, Thermometer, Droplets, Gauge, Stethoscope } from 'lucide-react';
import { TriageFormSchema } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface SignosVitalesFormProps {
  register: UseFormRegister<TriageFormSchema>;
  errors: FieldErrors<TriageFormSchema>;
  setValue: UseFormSetValue<TriageFormSchema>;
  watch: UseFormWatch<TriageFormSchema>;
}

interface VitalSignConfig {
  key: keyof TriageFormSchema;
  label: string;
  unit: string;
  min: number;
  max: number;
  step?: number;
  criticalLow?: number;
  criticalHigh?: number;
  warningLow?: number;
  warningHigh?: number;
  icon: typeof Heart;
  color: string;
}

const SIGNOS_VITALES: VitalSignConfig[] = [
  {
    key: 'frecuencia_cardiaca',
    label: 'Frecuencia Cardíaca',
    unit: 'lpm',
    min: 20,
    max: 250,
    criticalLow: 50,
    criticalHigh: 120,
    warningLow: 60,
    warningHigh: 100,
    icon: Heart,
    color: 'rose',
  },
  {
    key: 'frecuencia_respiratoria',
    label: 'Frecuencia Respiratoria',
    unit: 'rpm',
    min: 5,
    max: 60,
    criticalLow: 10,
    criticalHigh: 25,
    warningLow: 12,
    warningHigh: 20,
    icon: Wind,
    color: 'sky',
  },
  {
    key: 'temperatura',
    label: 'Temperatura',
    unit: '°C',
    min: 30,
    max: 45,
    step: 0.1,
    criticalLow: 35,
    criticalHigh: 38.5,
    warningLow: 36.5,
    warningHigh: 37.5,
    icon: Thermometer,
    color: 'orange',
  },
  {
    key: 'spO2',
    label: 'Saturación O₂ (SpO2)',
    unit: '%',
    min: 50,
    max: 100,
    criticalLow: 90,
    warningLow: 94,
    icon: Droplets,
    color: 'blue',
  },
  {
    key: 'presion_sistolica',
    label: 'Presión Sistólica',
    unit: 'mmHg',
    min: 50,
    max: 300,
    criticalLow: 90,
    criticalHigh: 180,
    warningLow: 100,
    warningHigh: 140,
    icon: Gauge,
    color: 'violet',
  },
  {
    key: 'presion_diastolica',
    label: 'Presión Diastólica',
    unit: 'mmHg',
    min: 30,
    max: 200,
    criticalLow: 60,
    criticalHigh: 110,
    warningLow: 60,
    warningHigh: 90,
    icon: Gauge,
    color: 'purple',
  },
  {
    key: 'dolor',
    label: 'Nivel de Dolor (EVA)',
    unit: '/10',
    min: 0,
    max: 10,
    warningHigh: 6,
    criticalHigh: 8,
    icon: Stethoscope,
    color: 'amber',
  },
];

function getAlertLevel(value: number | undefined, config: VitalSignConfig): 'normal' | 'warning' | 'critical' {
  if (value === undefined || isNaN(value)) return 'normal';
  
  if (config.criticalLow !== undefined && value <= config.criticalLow) return 'critical';
  if (config.criticalHigh !== undefined && value >= config.criticalHigh) return 'critical';
  if (config.warningLow !== undefined && value < config.warningLow) return 'warning';
  if (config.warningHigh !== undefined && value > config.warningHigh) return 'warning';
  
  return 'normal';
}

const colorClasses: Record<string, { bg: string; iconBg: string; text: string }> = {
  rose: { bg: 'bg-rose-50', iconBg: 'bg-rose-100', text: 'text-rose-600' },
  sky: { bg: 'bg-sky-50', iconBg: 'bg-sky-100', text: 'text-sky-600' },
  orange: { bg: 'bg-orange-50', iconBg: 'bg-orange-100', text: 'text-orange-600' },
  blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-600' },
  violet: { bg: 'bg-violet-50', iconBg: 'bg-violet-100', text: 'text-violet-600' },
  purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-100', text: 'text-purple-600' },
  amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-600' },
};

export function SignosVitalesForm({
  register,
  errors,
  watch,
}: SignosVitalesFormProps) {
  const criticalCount = SIGNOS_VITALES.filter(
    (v) => getAlertLevel(watch(v.key) as number, v) === 'critical'
  ).length;

  return (
    <CollapsibleSection
      title="Signos Vitales"
      icon={<Activity className="h-5 w-5" />}
      defaultOpen={true}
      badge={criticalCount > 0 ? `${criticalCount} crítico(s)` : undefined}
      badgeVariant="danger"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SIGNOS_VITALES.map((vital) => {
          const value = watch(vital.key) as number;
          const alertLevel = getAlertLevel(value, vital);
          const error = errors[vital.key];
          const Icon = vital.icon;
          const colors = colorClasses[vital.color];
          
          return (
            <div
              key={vital.key}
              className={cn(
                "p-4 rounded-xl border-2 transition-all duration-300",
                alertLevel === 'critical' && "border-red-400 bg-gradient-to-br from-red-50 to-rose-50 shadow-md shadow-red-100",
                alertLevel === 'warning' && "border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-md shadow-amber-100",
                alertLevel === 'normal' && `border-transparent ${colors.bg} hover:shadow-md`
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-lg",
                    alertLevel === 'critical' ? "bg-red-100" : 
                    alertLevel === 'warning' ? "bg-amber-100" : 
                    colors.iconBg
                  )}>
                    <Icon className={cn(
                      "h-4 w-4",
                      alertLevel === 'critical' ? "text-red-600" : 
                      alertLevel === 'warning' ? "text-amber-600" : 
                      colors.text
                    )} />
                  </div>
                  <Label className="text-sm font-semibold text-gray-700">
                    {vital.label}
                  </Label>
                </div>
                {alertLevel !== 'normal' && (
                  <div className={cn(
                    "p-1.5 rounded-full animate-pulse",
                    alertLevel === 'critical' ? "bg-red-100" : "bg-amber-100"
                  )}>
                    <AlertTriangle
                      className={cn(
                        "h-4 w-4",
                        alertLevel === 'critical' ? "text-red-500" : "text-amber-500"
                      )}
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step={vital.step || 1}
                  min={vital.min}
                  max={vital.max}
                  placeholder={`${vital.min}-${vital.max}`}
                  {...register(vital.key as any, { valueAsNumber: true })}
                  className={cn(
                    "text-lg font-bold text-center h-12 rounded-lg",
                    alertLevel === 'critical' && "border-red-400 bg-white focus:ring-red-200",
                    alertLevel === 'warning' && "border-amber-400 bg-white focus:ring-amber-200",
                    alertLevel === 'normal' && "bg-white/80"
                  )}
                />
                <span className={cn(
                  "text-sm font-semibold min-w-[55px] px-2 py-2 rounded-lg text-center",
                  alertLevel === 'critical' ? "bg-red-100 text-red-700" : 
                  alertLevel === 'warning' ? "bg-amber-100 text-amber-700" : 
                  `${colors.iconBg} ${colors.text}`
                )}>
                  {vital.unit}
                </span>
              </div>
              {error && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {error.message}
                </p>
              )}
              {alertLevel === 'critical' && (
                <div className="mt-2 p-2 bg-red-100 rounded-lg">
                  <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
                    ⚠️ Valor crítico - Atención inmediata
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}
