'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stethoscope, Loader2, Eye, EyeOff } from 'lucide-react';
import { isAuthenticated, login } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const ROLES = [
  { value: 'nurse',     label: 'Enfermero/a' },
  { value: 'physician', label: 'Médico/a' },
  { value: 'admin',     label: 'Administrador/a' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '', email: '', full_name: '', password: '', confirm: '', role: 'nurse',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated()) router.replace('/');
  }, [router]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.username || !form.email || !form.password) {
      setError('Usuario, correo y contraseña son obligatorios'); return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres'); return;
    }
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden'); return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          full_name: form.full_name || null,
          password: form.password,
          role: form.role,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Error al crear la cuenta');
      }

      // Auto-login after register
      await login(form.username, form.password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">MedAI</h1>
            <p className="text-teal-100 text-sm mt-0.5">Crear cuenta</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Usuario <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.username}
                    onChange={set('username')}
                    placeholder="usuario123"
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Rol</Label>
                  <select
                    value={form.role}
                    onChange={set('role')}
                    disabled={loading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Correo electrónico <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="correo@hospital.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Nombre completo
                </Label>
                <Input
                  value={form.full_name}
                  onChange={set('full_name')}
                  placeholder="Nombre y apellido (opcional)"
                  autoComplete="name"
                  disabled={loading}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Contraseña <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPass(v => !v)}
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Confirmar contraseña <span className="text-red-500">*</span>
                </Label>
                <Input
                  type={showPass ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white h-11 font-medium mt-2"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creando cuenta...</>
                  : 'Crear cuenta e ingresar'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-teal-600 font-medium hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
