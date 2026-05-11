'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { FactorRiesgo, FactorSHAP } from '@/types/triage';

interface SHAPChartProps {
  factoresRiesgo: FactorRiesgo[] | FactorSHAP[] | Record<string, number>;
}

export function SHAPChart({ factoresRiesgo }: SHAPChartProps) {
  if (!factoresRiesgo || (Array.isArray(factoresRiesgo) && factoresRiesgo.length === 0) || 
      (!Array.isArray(factoresRiesgo) && Object.keys(factoresRiesgo).length === 0)) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No hay datos de factores de riesgo disponibles</p>
      </div>
    );
  }

  let data: Array<{ factor: string; valor: number; color: string }>;

  if (Array.isArray(factoresRiesgo)) {
    const firstItem = factoresRiesgo[0];
    
    if ('nombre' in firstItem && 'valor' in firstItem) {
      data = (factoresRiesgo as FactorSHAP[])
        .map((item) => ({
          factor: item.nombre,
          valor: item.valor,
          color: item.valor >= 0 ? 'url(#shap-positive)' : 'url(#shap-negative)',
        }))
        .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
        .slice(0, 10);
    } else {
      const severityToValue: Record<string, number> = {
        alta: 0.8,
        media: 0.5,
        baja: 0.2,
      };
      data = (factoresRiesgo as FactorRiesgo[])
        .map((item) => ({
          factor: item.descripcion || item.factor,
          valor: severityToValue[item.severidad] || 0.5,
          color: item.severidad === 'alta' ? 'url(#shap-negative)' : 
                 item.severidad === 'media' ? 'url(#shap-warning)' : 'url(#shap-positive)',
        }))
        .slice(0, 10);
    }
  } else {
    data = Object.entries(factoresRiesgo)
      .map(([factor, valor]) => ({
        factor: formatFactorName(factor),
        valor: Number(valor),
        color: Number(valor) >= 0 ? 'url(#shap-negative)' : 'url(#shap-positive)',
      }))
      .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
      .slice(0, 10);
  }

  const maxAbsValue = Math.max(...data.map((d) => Math.abs(d.valor)), 0.01);
  const domainValue = Math.ceil(maxAbsValue * 100) / 100 + 0.01;

  return (
    <div className="w-full" style={{ minHeight: '320px', height: '320px' }}>
      <div className="flex items-center justify-center gap-6 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-rose-600"></div>
          <span className="text-muted-foreground">Aumenta urgencia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600"></div>
          <span className="text-muted-foreground">Disminuye urgencia</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 110, bottom: 10 }}
        >
          <defs>
            <linearGradient id="shap-positive" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="shap-negative" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="shap-warning" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <filter id="shadow-shap" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15"/>
            </filter>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            horizontal={true} 
            vertical={false}
            stroke="#e5e7eb"
          />
          <XAxis
            type="number"
            domain={[-domainValue, domainValue]}
            tickFormatter={(value) => value.toFixed(2)}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            type="category"
            dataKey="factor"
            tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
            width={105}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [value.toFixed(4), 'Impacto SHAP']}
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
              padding: '12px 16px',
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          />
          <ReferenceLine 
            x={0} 
            stroke="#9ca3af" 
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          <Bar 
            dataKey="valor" 
            radius={[4, 4, 4, 4]} 
            maxBarSize={28}
            filter="url(#shadow-shap)"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatFactorName(name: string): string {
  const mappings: Record<string, string> = {
    edad: 'Edad',
    genero: 'Género',
    frecuencia_cardiaca: 'Frec. Cardíaca',
    presion_sistolica: 'Presión Sistólica',
    presion_diastolica: 'Presión Diastólica',
    frecuencia_respiratoria: 'Frec. Respiratoria',
    temperatura: 'Temperatura',
    saturacion_oxigeno: 'Sat. Oxígeno',
    spO2: 'Sat. Oxígeno',
    diabetes: 'Diabetes',
    hipertension: 'Hipertensión',
    hta: 'Hipertensión',
    dm2: 'Diabetes',
    enfermedad_cardiaca: 'Enf. Cardíaca',
    cardiopatia: 'Cardiopatía',
    enfermedad_pulmonar: 'Enf. Pulmonar',
    epoc: 'EPOC',
    enfermedad_renal: 'Enf. Renal',
    irc: 'Enf. Renal',
    cancer: 'Cáncer',
    inmunosupresion: 'Inmunosupresión',
    embarazo: 'Embarazo',
    obesidad: 'Obesidad',
    requiere_labs: 'Req. Labs',
    requiere_imagenes: 'Req. Imágenes',
    es_prioritario: 'Es Prioritario',
    motivo_consulta: 'Motivo Consulta',
    dolor: 'Nivel de Dolor',
  };

  return mappings[name] || name.replace(/_/g, ' ');
}
