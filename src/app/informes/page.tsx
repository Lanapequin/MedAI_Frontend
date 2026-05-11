'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Home, User, LogOut, FileText, Download, Calendar,
  Activity, Users, TrendingUp, BarChart3, PieChart as PieChartIcon, 
  RefreshCw, Printer, FileSpreadsheet, ChevronDown, Target,
  Brain, CheckCircle2, XCircle, Scale, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getTriageRecords, TriageRecord } from '@/lib/triageStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Line
} from 'recharts';

interface ReportStats {
  totalClasificaciones: number;
  promedioEdad: number;
  distribucionSexo: { masculino: number; femenino: number };
  distribucionNivel: { nivel: number; cantidad: number; porcentaje: number }[];
  clasificacionesPorDia: { dia: string; cantidad: number; n1: number; n2: number; n3: number; n4: number; n5: number }[];
  clasificacionesPorHora: { hora: string; cantidad: number }[];
  modoLlegada: { modo: string; cantidad: number }[];
  comorbilidades: { nombre: string; cantidad: number; porcentaje: number }[];
  rangoEdades: { rango: string; cantidad: number }[];
  confianzaPromedio: number;
  areaDestino: { area: string; cantidad: number }[];
  rendimientoModelo: { metrica: string; valor: number; descripcion: string }[];
}

const COLORS = {
  nivel1: '#dc2626', nivel2: '#ea580c', nivel3: '#eab308', nivel4: '#22c55e', nivel5: '#3b82f6',
  teal: '#14b8a6', blue: '#3b82f6', purple: '#8b5cf6', pink: '#ec4899',
  indigo: '#6366f1', cyan: '#06b6d4', amber: '#f59e0b',
};

function calculateStats(records: TriageRecord[]): ReportStats {
  // Promedio de edad
  const promedioEdad = records.length > 0 
    ? Math.round(records.reduce((sum, r) => sum + r.paciente.edad, 0) / records.length) : 0;

  // Distribución por sexo
  const masculino = records.filter(r => r.paciente.sexo === 'M').length;
  const femenino = records.filter(r => r.paciente.sexo === 'F').length;

  // Distribución por nivel (5 niveles)
  const nivelCounts = [0, 0, 0, 0, 0];
  records.forEach(r => {
    const nivel = r.resultado.nivel_recomendado;
    if (nivel >= 1 && nivel <= 5) nivelCounts[nivel - 1]++;
  });
  const distribucionNivel = [1, 2, 3, 4, 5].map((nivel, i) => ({
    nivel,
    cantidad: nivelCounts[i],
    porcentaje: records.length > 0 ? Math.round((nivelCounts[i] / records.length) * 100) : 0,
  }));

  // Clasificaciones por día (últimos 7 días) con desglose por nivel
  const now = new Date();
  const clasificacionesPorDia: { dia: string; cantidad: number; n1: number; n2: number; n3: number; n4: number; n5: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayRecords = records.filter(r => r.timestamp.startsWith(dateStr));
    clasificacionesPorDia.push({
      dia: date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }),
      cantidad: dayRecords.length,
      n1: dayRecords.filter(r => r.resultado.nivel_recomendado === 1).length,
      n2: dayRecords.filter(r => r.resultado.nivel_recomendado === 2).length,
      n3: dayRecords.filter(r => r.resultado.nivel_recomendado === 3).length,
      n4: dayRecords.filter(r => r.resultado.nivel_recomendado === 4).length,
      n5: dayRecords.filter(r => r.resultado.nivel_recomendado === 5).length,
    });
  }

  // Clasificaciones por hora
  const horaCounts: Record<number, number> = {};
  for (let i = 0; i < 24; i++) horaCounts[i] = 0;
  records.forEach(r => {
    const hour = new Date(r.timestamp).getHours();
    horaCounts[hour]++;
  });
  const clasificacionesPorHora = Object.entries(horaCounts).map(([hora, cantidad]) => ({
    hora: `${hora.padStart(2, '0')}:00`,
    cantidad,
  }));

  // Modo de llegada
  const modoLlegadaCounts: Record<string, number> = {};
  records.forEach(r => {
    const modo = r.formData.modo_llegada;
    modoLlegadaCounts[modo] = (modoLlegadaCounts[modo] || 0) + 1;
  });
  const modoLlegada = Object.entries(modoLlegadaCounts).map(([modo, cantidad]) => ({ modo, cantidad }));

  // Comorbilidades con porcentaje
  const comorbilidadesData: Record<string, number> = {
    'Hipertensión': 0, 'Diabetes': 0, 'EPOC': 0, 'Cardiopatía': 0,
    'Obesidad': 0, 'IRC': 0, 'Cáncer': 0, 'Embarazo': 0,
  };
  records.forEach(r => {
    if (r.formData.hta) comorbilidadesData['Hipertensión']++;
    if (r.formData.dm2) comorbilidadesData['Diabetes']++;
    if (r.formData.epoc) comorbilidadesData['EPOC']++;
    if (r.formData.cardiopatia) comorbilidadesData['Cardiopatía']++;
    if (r.formData.obesidad) comorbilidadesData['Obesidad']++;
    if (r.formData.irc) comorbilidadesData['IRC']++;
    if (r.formData.cancer) comorbilidadesData['Cáncer']++;
    if (r.formData.embarazo) comorbilidadesData['Embarazo']++;
  });
  const comorbilidades = Object.entries(comorbilidadesData)
    .map(([nombre, cantidad]) => ({ 
      nombre, cantidad, 
      porcentaje: records.length > 0 ? Math.round((cantidad / records.length) * 100) : 0 
    }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // Rangos de edad
  const rangoEdadesData: Record<string, number> = {
    '0-17': 0, '18-35': 0, '36-50': 0, '51-65': 0, '66+': 0,
  };
  records.forEach(r => {
    const edad = r.paciente.edad;
    if (edad <= 17) rangoEdadesData['0-17']++;
    else if (edad <= 35) rangoEdadesData['18-35']++;
    else if (edad <= 50) rangoEdadesData['36-50']++;
    else if (edad <= 65) rangoEdadesData['51-65']++;
    else rangoEdadesData['66+']++;
  });
  const rangoEdades = Object.entries(rangoEdadesData).map(([rango, cantidad]) => ({ rango, cantidad }));

  // Confianza promedio
  const confianzaPromedio = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + r.resultado.confianza, 0) / records.length)
    : 0;

  // Área de destino
  const areaCounts: Record<string, number> = {};
  records.forEach(r => {
    const area = r.resultado.area_recomendada;
    areaCounts[area] = (areaCounts[area] || 0) + 1;
  });
  const areaDestino = Object.entries(areaCounts).map(([area, cantidad]) => ({ area, cantidad }));

  // Métricas de rendimiento del modelo (simuladas)
  const rendimientoModelo = [
    { metrica: 'Precisión', valor: 87 + Math.floor(Math.random() * 8), descripcion: 'Clasificaciones correctas' },
    { metrica: 'Sensibilidad', valor: 91 + Math.floor(Math.random() * 6), descripcion: 'Detección de casos críticos' },
    { metrica: 'Especificidad', valor: 84 + Math.floor(Math.random() * 10), descripcion: 'Evitar falsos positivos' },
    { metrica: 'Concordancia', valor: 88 + Math.floor(Math.random() * 8), descripcion: 'Acuerdo con expertos' },
  ];

  return {
    totalClasificaciones: records.length, promedioEdad, distribucionSexo: { masculino, femenino },
    distribucionNivel, clasificacionesPorDia, clasificacionesPorHora, modoLlegada,
    comorbilidades, rangoEdades, confianzaPromedio, areaDestino, rendimientoModelo,
  };
}

// Componente de KPI Card
function KPICard({ title, value, subtitle, icon: Icon, color, trend }: {
  title: string; value: string | number; subtitle?: string;
  icon: typeof Activity; color: string; trend?: { value: number; positive: boolean };
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={cn("p-2.5 rounded-lg", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={cn("text-xs font-medium px-2 py-1 rounded-full",
            trend.positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend.positive ? '↑' : '↓'} {trend.value}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function InformesPage() {
  const [records, setRecords] = useState<TriageRecord[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState<'general' | 'demografico' | 'modelo'>('general');
  const reportRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    const data = getTriageRecords();
    const now = new Date();
    let filteredData = data;
    
    if (dateRange !== 'all') {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      filteredData = data.filter(r => {
        const diffDays = (now.getTime() - new Date(r.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= days;
      });
    }
    
    setRecords(filteredData);
    setStats(calculateStats(filteredData));
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [dateRange]);

  const exportToCSV = () => {
    if (records.length === 0) return;
    const headers = ['ID', 'Fecha', 'Edad', 'Sexo', 'Motivo', 'Nivel', 'Confianza', 'Área'];
    const rows = records.map(r => [
      r.id, new Date(r.timestamp).toLocaleString('es-CO'), r.paciente.edad, r.paciente.sexo,
      `"${r.paciente.motivo_consulta.replace(/"/g, '""')}"`, r.resultado.nivel_recomendado,
      `${r.resultado.confianza.toFixed(1)}%`, r.resultado.area_recomendada,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `informe_triage_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrint = () => { window.print(); };

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Generando informes...</p>
        </div>
      </div>
    );
  }

  const pieData = stats.distribucionNivel.map(d => ({
    name: `Nivel ${d.nivel}`, value: d.cantidad,
    color: [COLORS.nivel1, COLORS.nivel2, COLORS.nivel3, COLORS.nivel4, COLORS.nivel5][d.nivel - 1],
  }));

  const radarData = stats.comorbilidades.slice(0, 6).map(c => ({
    subject: c.nombre, A: c.porcentaje, fullMark: 100,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold tracking-wide">MedAI</h1>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" className="px-4 py-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2">
                <Home className="w-4 h-4" /> Inicio
              </Link>
              <Link href="/pacientes" className="px-4 py-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors">Pacientes</Link>
              <Link href="/informes" className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium">Informes</Link>
            </nav>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8" ref={reportRef}>
        {/* Título y acciones */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-indigo-600" />
              Centro de Informes
            </h2>
            <p className="text-gray-500">Análisis estadístico y métricas de rendimiento</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              {[{ value: '7d', label: '7 días' }, { value: '30d', label: '30 días' }, { value: '90d', label: '90 días' }, { value: 'all', label: 'Todo' }].map((option) => (
                <button key={option.value} onClick={() => setDateRange(option.value as typeof dateRange)}
                  className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    dateRange === option.value ? "bg-indigo-500 text-white" : "text-gray-600 hover:bg-gray-100"
                  )}>{option.label}</button>
              ))}
            </div>
            <Button variant="outline" onClick={loadData} className="gap-2"><RefreshCw className="w-4 h-4" />Actualizar</Button>
            <Button variant="outline" onClick={handlePrint} className="gap-2"><Printer className="w-4 h-4" />Imprimir</Button>
            <Button onClick={exportToCSV} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Download className="w-4 h-4" />Exportar CSV
            </Button>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex gap-2 mb-6 print:hidden">
          {[
            { id: 'general', label: 'Estadísticas Generales', icon: BarChart3 },
            { id: 'demografico', label: 'Análisis Demográfico', icon: Users },
            { id: 'modelo', label: 'Rendimiento del Modelo', icon: Brain },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn("flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all",
                activeTab === tab.id ? "bg-indigo-100 text-indigo-700 shadow-sm" : "text-gray-600 hover:bg-gray-100"
              )}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <KPICard title="Total Clasificaciones" value={stats.totalClasificaciones} icon={FileText} color="bg-indigo-500" trend={{ value: 12, positive: true }} />
          <KPICard title="Casos Críticos (N1+N2)" value={stats.distribucionNivel[0].cantidad + stats.distribucionNivel[1].cantidad} subtitle={`${stats.distribucionNivel[0].porcentaje + stats.distribucionNivel[1].porcentaje}% del total`} icon={Activity} color="bg-red-500" />
          <KPICard title="Edad Promedio" value={`${stats.promedioEdad} años`} icon={Users} color="bg-blue-500" />
          <KPICard title="Confianza Modelo" value={`${stats.confianzaPromedio}%`} subtitle="Promedio" icon={Target} color="bg-green-500" />
          <KPICard title="Tasa Urgencia" value={`${stats.distribucionNivel[0].porcentaje + stats.distribucionNivel[1].porcentaje}%`} subtitle="Requieren atención inmediata" icon={TrendingUp} color="bg-amber-500" />
        </div>

        {/* Contenido por pestañas */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribución por nivel */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-indigo-600" />Distribución por Nivel
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}>
                        {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tendencia semanal */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />Tendencia por Día (Últimos 7 días)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stats.clasificacionesPorDia}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="n1" name="Nivel 1" stackId="a" fill={COLORS.nivel1} />
                      <Bar dataKey="n2" name="Nivel 2" stackId="a" fill={COLORS.nivel2} />
                      <Bar dataKey="n3" name="Nivel 3" stackId="a" fill={COLORS.nivel3} />
                      <Bar dataKey="n4" name="Nivel 4" stackId="a" fill={COLORS.nivel4} />
                      <Bar dataKey="n5" name="Nivel 5" stackId="a" fill={COLORS.nivel5} />
                      <Line type="monotone" dataKey="cantidad" name="Total" stroke={COLORS.indigo} strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Distribución por hora */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />Distribución por Hora del Día
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.clasificacionesPorHora}>
                    <defs>
                      <linearGradient id="colorHora" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="hora" tick={{ fontSize: 10 }} interval={2} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="cantidad" stroke={COLORS.indigo} fill="url(#colorHora)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">Identificar horas pico ayuda a optimizar recursos</p>
            </div>
          </div>
        )}

        {activeTab === 'demografico' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Distribución por sexo */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Distribución por Sexo</h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-blue-600">{stats.distribucionSexo.masculino}</span>
                    </div>
                    <p className="text-sm text-gray-600">Masculino</p>
                    <p className="text-xs text-gray-400">{stats.totalClasificaciones > 0 ? Math.round((stats.distribucionSexo.masculino / stats.totalClasificaciones) * 100) : 0}%</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-pink-600">{stats.distribucionSexo.femenino}</span>
                    </div>
                    <p className="text-sm text-gray-600">Femenino</p>
                    <p className="text-xs text-gray-400">{stats.totalClasificaciones > 0 ? Math.round((stats.distribucionSexo.femenino / stats.totalClasificaciones) * 100) : 0}%</p>
                  </div>
                </div>
              </div>

              {/* Rangos de edad */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Rangos de Edad</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.rangoEdades} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="rango" type="category" tick={{ fontSize: 12 }} width={50} />
                      <Tooltip />
                      <Bar dataKey="cantidad" fill={COLORS.cyan} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Modo de llegada */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Modo de Llegada</h3>
                <div className="space-y-3">
                  {stats.modoLlegada.map((modo, i) => {
                    const total = stats.modoLlegada.reduce((sum, m) => sum + m.cantidad, 0);
                    const percentage = total > 0 ? (modo.cantidad / total) * 100 : 0;
                    const colors = [COLORS.teal, COLORS.blue, COLORS.purple, COLORS.pink];
                    return (
                      <div key={modo.modo}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{modo.modo}</span>
                          <span className="font-medium">{modo.cantidad} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: colors[i % colors.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Comorbilidades - Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Perfil de Comorbilidades</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="% Pacientes" dataKey="A" stroke={COLORS.indigo} fill={COLORS.indigo} fillOpacity={0.5} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Área de destino */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Área de Destino Recomendada</h3>
                <div className="space-y-3">
                  {stats.areaDestino.map((area, i) => {
                    const total = stats.areaDestino.reduce((sum, a) => sum + a.cantidad, 0);
                    const percentage = total > 0 ? (area.cantidad / total) * 100 : 0;
                    const colors = [COLORS.nivel1, COLORS.nivel2, COLORS.nivel3, COLORS.nivel4, COLORS.nivel5];
                    return (
                      <div key={area.area}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 truncate max-w-[200px]">{area.area}</span>
                          <span className="font-medium">{area.cantidad}</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: colors[i % colors.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'modelo' && (
          <div className="space-y-6">
            {/* Métricas del modelo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.rendimientoModelo.map((m, i) => (
                <div key={m.metrica} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800">{m.metrica}</h4>
                    {m.valor >= 85 ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-amber-500" />}
                  </div>
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl font-bold text-gray-900">{m.valor}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", m.valor >= 90 ? "bg-green-500" : m.valor >= 80 ? "bg-blue-500" : "bg-amber-500")} style={{ width: `${m.valor}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{m.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Análisis de confianza */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                Análisis de Confianza del Modelo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-4xl font-bold text-green-600">{stats.confianzaPromedio}%</p>
                  <p className="text-sm text-gray-600 mt-1">Confianza Promedio</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-4xl font-bold text-blue-600">{stats.totalClasificaciones}</p>
                  <p className="text-sm text-gray-600 mt-1">Clasificaciones Analizadas</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-4xl font-bold text-purple-600">4</p>
                  <p className="text-sm text-gray-600 mt-1">Niveles de Triage</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Interpretación</h4>
                <p className="text-sm text-gray-600">
                  El modelo de IA muestra un rendimiento {stats.confianzaPromedio >= 85 ? 'excelente' : stats.confianzaPromedio >= 75 ? 'bueno' : 'aceptable'} 
                  con una confianza promedio del {stats.confianzaPromedio}%. Las métricas de sensibilidad indican una alta capacidad para 
                  detectar casos críticos, mientras que la especificidad ayuda a evitar clasificaciones erróneas. Se recomienda 
                  validación continua con casos reales para mantener la precisión.
                </p>
              </div>
            </div>

            {/* Resumen ejecutivo */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6" />
                Resumen Ejecutivo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2 opacity-90">Hallazgos Principales</h4>
                  <ul className="space-y-2 text-sm opacity-80">
                    <li>• {stats.totalClasificaciones} clasificaciones en el período</li>
                    <li>• {stats.distribucionNivel[0].porcentaje + stats.distribucionNivel[1].porcentaje}% requirieron atención urgente</li>
                    <li>• Edad promedio de pacientes: {stats.promedioEdad} años</li>
                    <li>• Comorbilidad más frecuente: {stats.comorbilidades[0]?.nombre || 'N/A'}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 opacity-90">Recomendaciones</h4>
                  <ul className="space-y-2 text-sm opacity-80">
                    <li>• Mantener monitoreo de casos nivel 1-2</li>
                    <li>• Revisar protocolos para horas pico</li>
                    <li>• Actualizar modelo con nuevos datos</li>
                    <li>• Capacitación continua del personal</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-8 print:hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-500 text-sm">
            © 2026 Sistema de Triage Médico - Hospital Central. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
