'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

const PUBLIC_PATHS = ['/login', '/register'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) {
      setChecking(false);
      return;
    }
    if (!isAuthenticated()) {
      router.replace('/login');
    } else {
      setChecking(false);
    }
  }, [pathname, router]);

  if (checking && !PUBLIC_PATHS.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return <>{children}</>;
}
