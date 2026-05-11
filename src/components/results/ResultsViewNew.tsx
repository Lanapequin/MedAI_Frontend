'use client';

import { TriageResponse } from '@/types/triage';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, AlertCircle, Clock, Building2, CheckCircle, 
  FileText, Printer, ArrowLeft, Activity, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ResultsViewNewProps {
  result: TriageResponse;
  onReset: () => void;
}

const TRIAGE_CONFIG: Record<number, { 
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
}> = {
  1: {
    label: 'Nivel 1 - Resucitación',
    color: '#dc2626',
    bgColor: 'bg-red-500',
    textColor: 'text-red-700',
    description: 'Atención inmediata requerida'
  },
  2: {
    label: 'Nivel 2 - Emergencia',
    color: '#ea580c',
    bgColor: 'bg-orange-500',
    textColor: 'text-orange-700',
    description: 'Atención muy urgente'
  },
  3: {
    label: 'Nivel 3 - Urgencia',
    color: '#eab308',
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    description: 'Atención urgente'
  },
  4: {
    label: 'Nivel 4 - Menos Urgente',
    color: '#22c55e',
    bgColor: 'bg-green-500',
    textColor: 'text-green-700',
    description: 'Puede esperar atención'
  },
  5: {
    label: 'Nivel 5 - No Urgente',
    color: '#3b82f6',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-700',
    description: 'Consulta externa / No urgente'
  },
};

export function ResultsViewNew({ result, onReset }: ResultsViewNewProps) {
  const config = TRIAGE_CONFIG[result.nivel_recomendado] || TRIAGE_CONFIG[3];
  
  // Preparar datos para el gráfico
  const chartData = result.probabilidades && typeof result.probabilidades === 'object'
    ? (Array.isArray(result.probabilidades) 
        ? result.probabilidades.map(p => ({
            name: `Nivel ${p.nivel}`,
            value: p.probabilidad,
            color: TRIAGE_CONFIG[p.nivel]?.color || '#6b7280'
          }))
        : Object.entries(result.probabilidades).map(([key, value]) => {
            const nivel = parseInt(key.replace(/\D/g, '')) || 1;
            return {
              name: key,
              value: Number(value),
              color: TRIAGE_CONFIG[nivel]?.color || '#6b7280'
            };
          }).sort((a, b) => {
            const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
            return numA - numB;
          })
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header con resultado principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Resultado de Clasificación</h2>
            </div>
            <Button 
              onClick={onReset}
              variant="outline" 
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Nueva Clasificación
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nivel de Triage */}
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gray-50">
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4",
                config.bgColor
              )}>
                {result.nivel_recomendado}
              </div>
              <h3 className="text-lg font-bold text-gray-800">{config.label}</h3>
              <p className="text-sm text-gray-500">{config.description}</p>
            </div>

            {/* Confianza y tiempo */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Confianza del Modelo</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-blue-700">
                    {result.confianza.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(result.confianza, 100)}%` }}
                  />
                </div>
              </div>

              {result.tiempo_atencion_recomendado && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-3 mb-1">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Tiempo de Atención</span>
                  </div>
                  <span className="text-xl font-bold text-amber-700">
                    {result.tiempo_atencion_recomendado}
                  </span>
                </div>
              )}
            </div>

            {/* Área recomendada */}
            <div className="space-y-4">
              {result.area_recomendada && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-3 mb-1">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">Área Recomendada</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-700">
                    {result.area_recomendada}
                  </span>
                </div>
              )}
              
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-3 mb-1">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Timestamp</span>
                </div>
                <span className="text-sm text-gray-600">
                  {new Date(result.timestamp).toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" />
          Descripción del Diagnóstico
        </h3>
        <p className="text-gray-600 leading-relaxed">{result.descripcion}</p>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Probabilidades */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Probabilidades por Nivel</h3>
          </div>
          <div className="p-5">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Probabilidad']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SHAP Feature Contributions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">
              Explicabilidad SHAP — Contribuciones por Variable
            </h3>
            {result.shap_base_value !== undefined && (
              <p className="text-xs text-gray-500 mt-0.5">
                Valor base del modelo: {result.shap_base_value.toFixed(4)}
              </p>
            )}
          </div>
          <div className="p-5">
            {result.factores_shap && result.factores_shap.length > 0 ? (
              <div className="space-y-2">
                {result.factores_shap.slice(0, 8).map((factor, index) => {
                  const isPositive = factor.valor >= 0;
                  const maxAbs = Math.max(...result.factores_shap.map(f => Math.abs(f.valor)));
                  const barWidth = maxAbs > 0 ? (Math.abs(factor.valor) / maxAbs) * 100 : 0;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700 truncate max-w-[55%]">
                          {factor.nombre}
                        </span>
                        <span className={cn(
                          "font-bold text-sm",
                          isPositive ? "text-orange-600" : "text-blue-600"
                        )}>
                          {factor.valor > 0 ? '+' : ''}{factor.valor.toFixed(4)}
                          <span className="text-xs ml-1 font-normal text-gray-500">
                            {isPositive ? '▲ urgencia' : '▼ urgencia'}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 h-4">
                        <div className="flex-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              isPositive ? "bg-orange-400 ml-auto" : "bg-blue-400"
                            )}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                      {factor.descripcion && (
                        <p className="text-xs text-gray-500 pl-1">{factor.descripcion}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No se calcularon valores SHAP para esta predicción
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Nota importante */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-amber-800 mb-1">Nota Importante</h4>
            <p className="text-amber-700 text-sm">
              Esta clasificación es una herramienta de apoyo y no reemplaza el criterio médico profesional. 
              El personal de salud debe validar y ajustar la clasificación según su evaluación clínica.
            </p>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="gap-2">
          <Printer className="w-4 h-4" />
          Imprimir Resultado
        </Button>
        <Button 
          onClick={onReset}
          className="gap-2 bg-teal-600 hover:bg-teal-700"
        >
          <RefreshCw className="w-4 h-4" />
          Nueva Clasificación
        </Button>
      </div>
    </div>
  );
}
