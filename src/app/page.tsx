'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Home, LogOut, User } from 'lucide-react';
import { TriageFormNew } from '@/components/TriageFormNew';
import { getUser, logout, AuthUser } from '@/lib/auth';

export default function HomePage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold tracking-wide">MedAI</h1>

            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium flex items-center gap-2">
                <Home className="w-4 h-4" />
                Inicio
              </Link>
              <Link href="/pacientes" className="px-4 py-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                Pacientes
              </Link>
              <Link href="/informes" className="px-4 py-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                Informes
              </Link>
            </nav>

            {/* User info + logout */}
            <div className="flex items-center gap-3">
              {user && (
                <span className="hidden sm:flex items-center gap-2 text-sm text-teal-100">
                  <User className="w-4 h-4" />
                  {user.full_name || user.username}
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">
                    {user.role}
                  </span>
                </span>
              )}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <TriageFormNew />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-500 text-sm">
            © 2026 Sistema de Triage Médico - Hospital Central. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
