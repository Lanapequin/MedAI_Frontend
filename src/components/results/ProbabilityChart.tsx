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
} from 'recharts';
import { ProbabilidadesNivel } from '@/types/triage';

interface ProbabilityChartProps {
  probabilidades: ProbabilidadesNivel[] | Record<string, number>;
}

const COLORS: Record<string, { main: string; gradient: string }> = {
  '1': { main: '#ef4444', gradient: 'url(#gradient-1)' },
  '2': { main: '#f97316', gradient: 'url(#gradient-2)' },
  '3': { main: '#eab308', gradient: 'url(#gradient-3)' },
  '4': { main: '#22c55e', gradient: 'url(#gradient-4)' },
};

const LABELS: Record<string, string> = {
  '1': 'Resucitación',
  '2': 'Emergencia',
  '3': 'Urgencia',
  '4': 'Menos Urgente',
};

export function ProbabilityChart({ probabilidades }: ProbabilityChartProps) {
  if (!probabilidades || (Array.isArray(probabilidades) && probabilidades.length === 0) ||
      (!Array.isArray(probabilidades) && Object.keys(probabilidades).length === 0)) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No hay datos de probabilidades disponibles</p>
      </div>
    );
  }

  let data: Array<{ nivel: string; label: string; probabilidad: number; color: string; colorKey: string }>;

  if (Array.isArray(probabilidades)) {
    data = probabilidades.map((p) => ({
      nivel: `Nivel ${p.nivel}`,
      label: LABELS[String(p.nivel)] || p.descripcion || `Nivel ${p.nivel}`,
      probabilidad: p.probabilidad,
      color: p.color || COLORS[String(p.nivel)]?.main || '#6b7280',
      colorKey: String(p.nivel),
    }));
  } else {
    data = Object.entries(probabilidades)
      .map(([key, valor]) => {
        const nivelNum = key.replace(/\D/g, '') || key;
        return {
          nivel: key.startsWith('Nivel') ? key : `Nivel ${key}`,
          label: LABELS[nivelNum] || key,
          probabilidad: Number(valor),
          color: COLORS[nivelNum]?.main || '#6b7280',
          colorKey: nivelNum,
        };
      })
      .sort((a, b) => {
        const numA = parseInt(a.nivel.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.nivel.replace(/\D/g, '')) || 0;
        return numA - numB;
      });
  }

  return (
    <div className="w-full" style={{ minHeight: '280px', height: '280px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 90, bottom: 10 }}
        >
          <defs>
            <linearGradient id="gradient-1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="gradient-2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="gradient-3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="gradient-4" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
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
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
            width={85}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Probabilidad']}
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
          <Bar
            dataKey="probabilidad"
            radius={[0, 8, 8, 0]}
            maxBarSize={35}
            filter="url(#shadow)"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.colorKey]?.gradient || entry.color} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
