import type { Metadata } from 'next';
import './globals.css';
import { AuthGuard } from '@/components/AuthGuard';

export const metadata: Metadata = {
  title: 'MedAI - Sistema de Triage Clínico',
  description: 'Sistema de clasificación de urgencias asistido por Inteligencia Artificial Explicable',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
