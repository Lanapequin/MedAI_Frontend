'use client';

import { TriageResponse } from '@/types/triage';
import { TriageLevelDisplay } from './TriageLevelDisplay';
import { ProbabilityChart } from './ProbabilityChart';
import { SHAPChart } from './SHAPChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Calendar, Clock, Building2, CheckCircle } from 'lucide-react';

interface ResultsViewProps {
  result: TriageResponse;
  onReset: () => void;
}

export function ResultsView({ result, onReset }: ResultsViewProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header mejorado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-600">Análisis Completado</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Resultado de Clasificación</h2>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {new Date(result.timestamp).toLocaleString('es-CO', {
                dateStyle: 'long',
                timeStyle: 'short'
              })}
            </span>
          </div>
        </div>
        <Button 
          onClick={onReset} 
          variant="outline" 
          className="gap-2 shadow-sm hover:shadow-md transition-shadow"
        >
          <RefreshCw className="h-4 w-4" />
          Nueva Clasificación
        </Button>
      </div>

      {/* Main Result con animación */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <TriageLevelDisplay
          nivel={result.nivel_recomendado}
          descripcion={result.descripcion}
          confianza={result.confianza}
          tiempoAtencion={result.tiempo_atencion_recomendado}
          areaRecomendada={result.area_recomendada}
        />
      </div>

      {/* Disclaimer mejorado */}
      <Card className="border-amber-200/70 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <CardContent className="py-4">
          <div className="flex gap-4">
            <div className="bg-amber-100 p-2 rounded-lg h-fit">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-amber-800">
              <p className="font-semibold mb-1">Nota importante</p>
              <p className="text-sm">
                Esta clasificación es una herramienta de apoyo y no reemplaza el criterio médico profesional. 
                El personal de salud debe validar y ajustar la clasificación según su evaluación clínica.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid con cards mejoradas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Card className="card-hover shadow-lg h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Distribución de Probabilidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProbabilityChart probabilidades={result.probabilidades} />
            </CardContent>
          </Card>
        </div>
        
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Card className="card-hover shadow-lg h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                Factores de Riesgo (SHAP)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SHAPChart factoresRiesgo={result.factores_shap} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Info mejorado */}
      {(result.tiempo_atencion_recomendado || result.area_recomendada) && (
        <Card className="shadow-lg animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              Recomendaciones de Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.tiempo_atencion_recomendado && (
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-blue-800">Tiempo máximo de espera</p>
                  </div>
                  <p className="text-xl font-bold text-blue-900 ml-12">{result.tiempo_atencion_recomendado}</p>
                </div>
              )}
              {result.area_recomendada && (
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Building2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium text-emerald-800">Área recomendada</p>
                  </div>
                  <p className="text-xl font-bold text-emerald-900 ml-12">{result.area_recomendada}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
