'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, MapPin, CheckCircle2, Activity } from 'lucide-react';

interface TriageLevelDisplayProps {
  nivel: number;
  descripcion: string;
  confianza: number;
  tiempoAtencion?: string;
  areaRecomendada?: string;
}

const TRIAGE_CONFIG: Record<number, { 
  gradient: string; 
  bg: string; 
  border: string; 
  text: string; 
  badge: string;
  glow: string;
  icon: string;
}> = {
  1: {
    gradient: 'from-red-500 to-red-700',
    bg: 'bg-gradient-to-br from-red-50 to-rose-50',
    border: 'border-red-400',
    text: 'text-red-800',
    badge: 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30',
    glow: 'shadow-red-500/20',
    icon: 'text-red-600',
  },
  2: {
    gradient: 'from-orange-500 to-orange-700',
    bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
    border: 'border-orange-400',
    text: 'text-orange-800',
    badge: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30',
    glow: 'shadow-orange-500/20',
    icon: 'text-orange-600',
  },
  3: {
    gradient: 'from-yellow-500 to-yellow-700',
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    border: 'border-yellow-400',
    text: 'text-yellow-800',
    badge: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30',
    glow: 'shadow-yellow-500/20',
    icon: 'text-yellow-600',
  },
  4: {
    gradient: 'from-green-500 to-green-700',
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
    border: 'border-green-400',
    text: 'text-green-800',
    badge: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30',
    glow: 'shadow-green-500/20',
    icon: 'text-green-600',
  },
};

const TRIAGE_LABELS: Record<number, string> = {
  1: 'Resucitación',
  2: 'Emergencia',
  3: 'Urgencia',
  4: 'Menos Urgente',
};

export function TriageLevelDisplay({
  nivel,
  descripcion,
  confianza,
  tiempoAtencion,
  areaRecomendada,
}: TriageLevelDisplayProps) {
  const config = TRIAGE_CONFIG[nivel] || TRIAGE_CONFIG[3];
  const label = TRIAGE_LABELS[nivel] || 'Desconocido';

  return (
    <div className={cn(
      'rounded-2xl p-6 border-l-4 shadow-xl animate-scale-in',
      config.bg, 
      config.border,
      `shadow-xl ${config.glow}`
    )}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Nivel y descripción */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div
              className={cn(
                'w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold',
                'transform transition-transform hover:scale-105',
                config.badge
              )}
            >
              {nivel}
            </div>
            <div className={cn(
              'absolute -bottom-1 -right-1 w-8 h-8 rounded-lg flex items-center justify-center',
              'bg-white shadow-md'
            )}>
              <Activity className={cn('w-5 h-5', config.icon)} />
            </div>
          </div>
          <div>
            <Badge className={cn(
              'mb-3 px-4 py-1.5 text-sm font-semibold rounded-full',
              config.badge
            )}>
              Nivel {nivel} - {label}
            </Badge>
            <p className={cn('text-lg font-semibold leading-snug', config.text)}>
              {descripcion}
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="flex flex-col gap-3">
          <div className={cn(
            'flex items-center gap-3 px-4 py-2.5 rounded-xl',
            'bg-white/70 backdrop-blur-sm shadow-sm'
          )}>
            <CheckCircle2 className={cn('h-5 w-5', config.icon)} />
            <div>
              <span className="text-sm text-muted-foreground">Confianza</span>
              <p className="font-bold text-lg">{confianza.toFixed(1)}%</p>
            </div>
          </div>
          
          {tiempoAtencion && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white/50 rounded-lg">
              <Clock className={cn('h-5 w-5', config.icon)} />
              <span className="text-sm">
                <span className="text-muted-foreground">Tiempo: </span>
                <strong>{tiempoAtencion}</strong>
              </span>
            </div>
          )}
          
          {areaRecomendada && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white/50 rounded-lg">
              <MapPin className={cn('h-5 w-5', config.icon)} />
              <span className="text-sm">
                <span className="text-muted-foreground">Área: </span>
                <strong>{areaRecomendada}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Barra de confianza mejorada */}
      <div className="mt-6 pt-4 border-t border-current/10">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground font-medium">Nivel de confianza del modelo</span>
          <span className={cn('font-bold', config.text)}>{confianza.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-white/80 rounded-full overflow-hidden shadow-inner">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700 ease-out',
              `bg-gradient-to-r ${config.gradient}`
            )}
            style={{ width: `${Math.min(confianza, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
