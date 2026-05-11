'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Home, User, LogOut, Search, Filter, 
  ChevronLeft, ChevronRight, Eye, Clock,
  Activity, AlertTriangle, Calendar, Download,
  SortAsc, SortDesc, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getTriageRecords, clearTriageRecords, TriageRecord } from '@/lib/triageStore';

// Badge de nivel de triage
function TriageBadge({ nivel }: { nivel: number }) {
  const config: Record<number, { bg: string; text: string; label: string; dot: string }> = {
    1: { bg: 'bg-red-100', text: 'text-red-700', label: 'Nivel 1 - Crítico', dot: 'bg-red-500' },
    2: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Nivel 2 - Emergencia', dot: 'bg-orange-500' },
    3: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Nivel 3 - Urgencia', dot: 'bg-yellow-500' },
    4: { bg: 'bg-green-100', text: 'text-green-700', label: 'Nivel 4 - Menos Urgente', dot: 'bg-green-500' },
    5: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Nivel 5 - No Urgente', dot: 'bg-blue-500' },
  };
  
  const c = config[nivel] || config[3];

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium", c.bg, c.text)}>
      <span className={cn("w-2 h-2 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

// Modal de detalle del paciente
function PatientDetailModal({ 
  record, 
  onClose 
}: { 
  record: TriageRecord; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Detalle de Clasificación</h2>
            <p className="text-teal-100 text-sm">ID: {record.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos del paciente */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                Datos del Paciente
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Edad:</span>
                  <span className="font-medium">{record.paciente.edad} años</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sexo:</span>
                  <span className="font-medium">{record.paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Modo de llegada:</span>
                  <span className="font-medium">{record.formData.modo_llegada}</span>
                </div>
              </div>
            </div>

            {/* Resultado */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                Resultado de Clasificación
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Nivel:</span>
                  <TriageBadge nivel={record.resultado.nivel_recomendado} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Confianza:</span>
                  <span className="font-medium">{Math.min(record.resultado.confianza, 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Área:</span>
                  <span className="font-medium text-right">{record.resultado.area_recomendada}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tiempo:</span>
                  <span className="font-medium">{record.resultado.tiempo_atencion_recomendado}</span>
                </div>
              </div>
            </div>

            {/* Motivo de consulta */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-teal-600" />
                Motivo de Consulta
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{record.paciente.motivo_consulta}</p>
              </div>
            </div>

            {/* Signos vitales */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                Signos Vitales
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Presión Sistólica', value: `${record.formData.presion_sistolica} mmHg` },
                  { label: 'Presión Diastólica', value: `${record.formData.presion_diastolica} mmHg` },
                  { label: 'Frec. Cardíaca', value: `${record.formData.frecuencia_cardiaca} lpm` },
                  { label: 'Frec. Respiratoria', value: `${record.formData.frecuencia_respiratoria} rpm` },
                  { label: 'Temperatura', value: `${record.formData.temperatura?.toFixed(1)}°C` },
                  { label: 'SpO2', value: `${record.formData.spO2}%` },
                  { label: 'Dolor', value: `${record.formData.dolor}/10` },
                ].map((signo) => (
                  <div key={signo.label} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">{signo.label}</p>
                    <p className="font-semibold text-gray-800">{signo.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Comorbilidades */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-semibold text-gray-800">Comorbilidades</h3>
              <div className="flex flex-wrap gap-2">
                {record.formData.hta && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">HTA</span>}
                {record.formData.dm2 && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">Diabetes</span>}
                {record.formData.epoc && <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">EPOC</span>}
                {record.formData.irc && <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">IRC</span>}
                {record.formData.cardiopatia && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">Cardiopatía</span>}
                {record.formData.obesidad && <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">Obesidad</span>}
                {record.formData.cancer && <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">Cáncer</span>}
                {record.formData.embarazo && <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm">Embarazo</span>}
                {!record.formData.hta && !record.formData.dm2 && !record.formData.epoc && !record.formData.irc && 
                 !record.formData.cardiopatia && !record.formData.obesidad && !record.formData.cancer && !record.formData.embarazo && (
                  <span className="text-gray-500 text-sm">Sin comorbilidades registradas</span>
                )}
              </div>
            </div>

            {/* Probabilidades */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-semibold text-gray-800">Probabilidades por Nivel</h3>
              <div className="space-y-2">
                {record.resultado.probabilidades.map((prob) => (
                  <div key={prob.nivel} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-20">Nivel {prob.nivel}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${prob.probabilidad}%`,
                          backgroundColor: prob.color
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-14 text-right">{prob.probabilidad.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PacientesPage() {
  const [records, setRecords] = useState<TriageRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<TriageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNivel, setFilterNivel] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<TriageRecord | null>(null);
  
  const itemsPerPage = 10;

  useEffect(() => {
    const data = getTriageRecords();
    setRecords(data);
    setFilteredRecords(data);
    setIsLoading(false);
  }, []);

  // Filtrar y ordenar
  useEffect(() => {
    let result = [...records];
    
    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.paciente.motivo_consulta.toLowerCase().includes(term) ||
        r.id.toLowerCase().includes(term) ||
        r.paciente.edad.toString().includes(term)
      );
    }
    
    // Filtrar por nivel
    if (filterNivel !== null) {
      result = result.filter(r => r.resultado.nivel_recomendado === filterNivel);
    }
    
    // Ordenar
    result.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredRecords(result);
    setCurrentPage(1);
  }, [records, searchTerm, filterNivel, sortOrder]);

  // Paginación
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSearchTerm('');
    setFilterNivel(null);
    setSortOrder('desc');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold tracking-wide">
              MedAI
            </h1>
            
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" className="px-4 py-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2">
                <Home className="w-4 h-4" />
                Inicio
              </Link>
              <Link href="/pacientes" className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium">
                Pacientes
              </Link>
              <Link href="/informes" className="px-4 py-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                Informes
              </Link>
            </nav>


          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Título */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Historial de Pacientes</h2>
            <p className="text-gray-500">{filteredRecords.length} registros encontrados</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                if (confirm('¿Deseas limpiar todos los datos? Esta acción no se puede deshacer.')) {
                  clearTriageRecords();
                  setRecords([]);
                  setFilteredRecords([]);
                }
              }}
              variant="outline"
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
              Limpiar Datos
            </Button>
            <Link href="/">
              <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
                <Activity className="w-4 h-4" />
                Nueva Clasificación
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Buscar por motivo, ID o edad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por nivel */}
            <div className="flex gap-2">
              <select
                value={filterNivel ?? ''}
                onChange={(e) => setFilterNivel(e.target.value ? Number(e.target.value) : null)}
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm min-w-[180px]"
              >
                <option value="">Todos los niveles</option>
                <option value="1">Nivel 1 - Resucitación</option>
                <option value="2">Nivel 2 - Emergencia</option>
                <option value="3">Nivel 3 - Urgencia</option>
                <option value="4">Nivel 4 - Menos Urgente</option>
                <option value="5">Nivel 5 - No Urgente</option>
              </select>

              {/* Ordenar */}
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="gap-2"
              >
                {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                {sortOrder === 'desc' ? 'Más reciente' : 'Más antiguo'}
              </Button>

              {/* Limpiar filtros */}
              {(searchTerm || filterNivel !== null) && (
                <Button variant="outline" onClick={clearFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Paciente</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Motivo</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Nivel</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Confianza</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fecha/Hora</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {record.paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}
                            </p>
                            <p className="text-sm text-gray-500">{record.paciente.edad} años</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700 truncate max-w-[250px]" title={record.paciente.motivo_consulta}>
                          {record.paciente.motivo_consulta}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <TriageBadge nivel={record.resultado.nivel_recomendado} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-teal-500 h-2 rounded-full"
                              style={{ width: `${Math.min(record.resultado.confianza, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.min(record.resultado.confianza, 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <div>
                            <p className="text-sm">
                              {new Date(record.timestamp).toLocaleDateString('es-CO')}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(record.timestamp).toLocaleTimeString('es-CO', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRecord(record)}
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">No se encontraron registros</p>
                        <p className="text-sm">Intenta con otros términos de búsqueda</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredRecords.length)} de {filteredRecords.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? 'bg-teal-600 hover:bg-teal-700' : ''}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-500 text-sm">
            © 2026 Sistema de Triage Médico - Hospital Central. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* Modal de detalle */}
      {selectedRecord && (
        <PatientDetailModal 
          record={selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
        />
      )}
    </div>
  );
}
