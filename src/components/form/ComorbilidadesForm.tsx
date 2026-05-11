'use client';

import { CollapsibleSection } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Heart, Pill, Activity, Stethoscope, HeartPulse, Scale, Ribbon, Baby } from 'lucide-react';
import { TriageFormSchema } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface ComorbilidadesFormProps {
  register: UseFormRegister<TriageFormSchema>;
  watch: UseFormWatch<TriageFormSchema>;
  setValue: UseFormSetValue<TriageFormSchema>;
}

const COMORBILIDADES = [
  { key: 'hta' as const, label: 'Hipertensión Arterial', abbr: 'HTA', icon: Activity, color: 'red' },
  { key: 'dm2' as const, label: 'Diabetes Mellitus Tipo 2', abbr: 'DM2', icon: Pill, color: 'blue' },
  { key: 'epoc' as const, label: 'EPOC', abbr: 'EPOC', icon: Stethoscope, color: 'cyan' },
  { key: 'irc' as const, label: 'Insuficiencia Renal Crónica', abbr: 'IRC', icon: Heart, color: 'purple' },
  { key: 'cardiopatia' as const, label: 'Cardiopatía', abbr: 'Cardio', icon: HeartPulse, color: 'rose' },
  { key: 'obesidad' as const, label: 'Obesidad', abbr: 'Obes', icon: Scale, color: 'amber' },
  { key: 'cancer' as const, label: 'Cáncer', abbr: 'Ca', icon: Ribbon, color: 'pink' },
  { key: 'embarazo' as const, label: 'Embarazo', abbr: 'Emb', icon: Baby, color: 'teal' },
];

const colorMap: Record<string, { active: string; badge: string; iconBg: string }> = {
  red: { active: 'border-red-300 bg-gradient-to-r from-red-50 to-rose-50', badge: 'bg-gradient-to-r from-red-500 to-rose-500', iconBg: 'bg-red-100 text-red-600' },
  blue: { active: 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50', badge: 'bg-gradient-to-r from-blue-500 to-indigo-500', iconBg: 'bg-blue-100 text-blue-600' },
  cyan: { active: 'border-cyan-300 bg-gradient-to-r from-cyan-50 to-sky-50', badge: 'bg-gradient-to-r from-cyan-500 to-sky-500', iconBg: 'bg-cyan-100 text-cyan-600' },
  purple: { active: 'border-purple-300 bg-gradient-to-r from-purple-50 to-violet-50', badge: 'bg-gradient-to-r from-purple-500 to-violet-500', iconBg: 'bg-purple-100 text-purple-600' },
  rose: { active: 'border-rose-300 bg-gradient-to-r from-rose-50 to-pink-50', badge: 'bg-gradient-to-r from-rose-500 to-pink-500', iconBg: 'bg-rose-100 text-rose-600' },
  amber: { active: 'border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50', badge: 'bg-gradient-to-r from-amber-500 to-yellow-500', iconBg: 'bg-amber-100 text-amber-600' },
  pink: { active: 'border-pink-300 bg-gradient-to-r from-pink-50 to-fuchsia-50', badge: 'bg-gradient-to-r from-pink-500 to-fuchsia-500', iconBg: 'bg-pink-100 text-pink-600' },
  teal: { active: 'border-teal-300 bg-gradient-to-r from-teal-50 to-emerald-50', badge: 'bg-gradient-to-r from-teal-500 to-emerald-500', iconBg: 'bg-teal-100 text-teal-600' },
};

export function ComorbilidadesForm({
  watch,
  setValue,
}: ComorbilidadesFormProps) {
  const activeCount = COMORBILIDADES.filter(c => watch(c.key)).length;

  return (
    <CollapsibleSection
      title="Comorbilidades"
      icon={<Heart className="h-5 w-5" />}
      defaultOpen={false}
      badge={activeCount > 0 ? `${activeCount} activa(s)` : undefined}
      badgeVariant="warning"
    >
      <p className="text-sm text-muted-foreground mb-5">
        Seleccione las condiciones médicas preexistentes del paciente
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {COMORBILIDADES.map(({ key, label, abbr, icon: Icon, color }) => {
          const isChecked = watch(key) || false;
          const colors = colorMap[color];
          
          return (
            <label
              key={key}
              htmlFor={key}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                isChecked
                  ? `${colors.active} shadow-md`
                  : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  isChecked ? colors.iconBg : "bg-gray-100 text-gray-400"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <span
                    className={cn(
                      "block font-semibold text-sm",
                      isChecked ? "text-gray-900" : "text-gray-700"
                    )}
                  >
                    {label}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1",
                      isChecked 
                        ? `${colors.badge} text-white shadow-sm` 
                        : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {abbr}
                  </span>
                </div>
              </div>
              <Switch
                id={key}
                checked={isChecked}
                onCheckedChange={(checked) => setValue(key, checked)}
                className={cn(
                  isChecked && "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-amber-500"
                )}
              />
            </label>
          );
        })}
      </div>

      {activeCount >= 3 && (
        <div className="mt-5 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-red-800 font-bold text-sm">
                ⚠️ Múltiples comorbilidades detectadas ({activeCount})
              </p>
              <p className="text-red-600 text-sm mt-1">
                El paciente presenta múltiples factores de riesgo que pueden aumentar la gravedad del triage.
              </p>
            </div>
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
}
