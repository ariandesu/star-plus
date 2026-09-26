'use client';

/**
 * Client-side route guard for the role-protected dashboards.
 *
 * The app is a static export (no server middleware), so protection is enforced
 * in the browser: an unauthenticated visitor is redirected to the sign-in page
 * and the protected content is never rendered. This is a demo access boundary
 * for role separation, not a security boundary — the "credentials" ship in the
 * bundle, and the health data is simulated.
 *
 * Rendering is gated on `ready` so protected UI never flashes before the
 * session check completes.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import type { Role } from '@/types';

interface RouteGuardProps {
  /** Roles permitted to view the wrapped content. Omitted means any role. */
  allow?: Role[];
  children: React.ReactNode;
}

export default function RouteGuard({ allow, children }: RouteGuardProps) {
  const router = useRouter();
  const [state, setState] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    const session = authService.getSession();
    if (!session?.isAuthenticated) {
      router.replace('/');
      setState('denied');
      return;
    }
    if (allow && !allow.includes(session.role)) {
      // Authenticated but not permitted here: send them to their own landing.
      router.replace(authService.getRoleDefaultRoute(session.role));
      setState('denied');
      return;
    }
    setState('allowed');
  }, [allow, router]);

  if (state !== 'allowed') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          <p className="text-xs font-semibold text-slate-500">
            {state === 'checking' ? 'Verifying session…' : 'Redirecting…'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
