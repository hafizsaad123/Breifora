import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, login } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<{
    isAuthenticated: boolean;
    isVerified: boolean;
    isOnboarded: boolean;
  }>({
    isAuthenticated: false,
    isVerified: false,
    isOnboarded: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function checkRouteAuth() {
      try {
        // 1. Check local bypass session (e.g. rate limit fallback / temporary offline users)
        if (user && user.id && user.id.startsWith('usr-')) {
          if (isMounted) {
            setAuthStatus({
              isAuthenticated: true,
              isVerified: true,
              isOnboarded: user.onboarded ?? true,
            });
            setIsLoading(false);
          }
          return;
        }

        // 2. Fetch active session directly from Supabase
        const { data: { user: sbUser }, error: userError } = await supabase.auth.getUser();

        if (userError || !sbUser) {
          // No Supabase session, check if there's any fallback user in localStorage
          const stored = localStorage.getItem('briefora_user') || localStorage.getItem('briefora_current_user');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed && parsed.id && parsed.id.startsWith('usr-')) {
                if (isMounted) {
                  setAuthStatus({
                    isAuthenticated: true,
                    isVerified: true,
                    isOnboarded: parsed.onboarded ?? true,
                  });
                  setIsLoading(false);
                }
                return;
              }
            } catch {}
          }

          if (isMounted) {
            setAuthStatus({
              isAuthenticated: false,
              isVerified: false,
              isOnboarded: false,
            });
            setIsLoading(false);
          }
          return;
        }

        // 3. User exists in Supabase. Check if email is confirmed.
        const isVerified = !!sbUser.email_confirmed_at;

        // 4. Check onboarding completion from profiles or metadata
        let isOnboarded = false;
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('onboarding_completed, onboarded')
            .eq('id', sbUser.id)
            .maybeSingle();

          if (!profileError && profile) {
            isOnboarded = profile.onboarding_completed ?? profile.onboarded ?? false;
          } else {
            isOnboarded = sbUser.user_metadata?.onboarding_completed ?? sbUser.user_metadata?.onboarded ?? false;
          }
        } catch (profileErr) {
          console.warn('AuthGuard: profile fetch failed, using metadata fallback', profileErr);
          isOnboarded = sbUser.user_metadata?.onboarding_completed ?? sbUser.user_metadata?.onboarded ?? false;
        }

        if (isMounted) {
          setAuthStatus({
            isAuthenticated: true,
            isVerified,
            isOnboarded,
          });
          setIsLoading(false);
        }
      } catch (err) {
        console.error('AuthGuard verification error:', err);
        if (isMounted) {
          setAuthStatus({
            isAuthenticated: false,
            isVerified: false,
            isOnboarded: false,
          });
          setIsLoading(false);
        }
      }
    }

    checkRouteAuth();

    return () => {
      isMounted = false;
    };
  }, [user, location.pathname]);

  // Render centered loading state while validating session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-10 h-10 text-[#2516FF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">Securing Session...</p>
        </div>
      </div>
    );
  }

  // 1. Enforce Authentication
  if (!authStatus.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Enforce Email Verification
  if (!authStatus.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // 3. Enforce Onboarding Completion
  if (!authStatus.isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
