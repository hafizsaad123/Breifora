import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  free_credits?: number;
  subscription_status?: 'free' | 'starter' | 'pro' | 'studio';
  firstName?: string;
  lastName?: string;
  avatar?: string;
  workspaceName?: string;
  onboarded?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, role?: 'user' | 'admin', userObj?: User) => void;
  logout: () => void;
  decrementCredit: () => boolean;
  updateUser: (fields: Partial<User>) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('briefora_user') || localStorage.getItem('briefora_current_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.free_credits === undefined) {
          parsed.free_credits = 1;
        }
        if (!parsed.subscription_status) {
          parsed.subscription_status = 'free';
        }
        return parsed;
      } catch {}
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('briefora_user', JSON.stringify(user));
    }
  }, [user]);

  // One-time verification & sync of profile on application startup
  useEffect(() => {
    const initProfile = async () => {
      if (!user?.id || user.id.startsWith('usr-')) return; // ignore temp local users
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.warn('Error verifying profile on auth init:', error);
          return;
        }

        if (!data) {
          // Profile does not exist anymore (deleted by admin)
          console.warn('Profile does not exist, force signing out.');
          logout();
          window.location.href = '/login?notice=deleted';
        } else {
          // Check if status is inactive or blocked
          const statusValue = (data.status?.toLowerCase() || 'active');
          if (statusValue === 'inactive' || statusValue === 'blocked') {
            console.warn(`Profile status is ${statusValue}, force signing out.`);
            logout();
            window.location.href = `/login?notice=${statusValue}`;
            return;
          }

          // Sync existing plan and credit details
          const planValue = (data.plan?.toLowerCase() || 'free') as 'free' | 'starter' | 'pro' | 'studio';
          setUser((prev: any) => {
            if (!prev) return null;
            const merged = {
              ...prev,
              name: data.name || prev.name,
              firstName: data.firstName || data.first_name || prev.firstName,
              lastName: data.lastName || data.last_name || prev.lastName,
              avatar: data.avatar || prev.avatar,
              workspaceName: data.workspaceName || data.workspace_name || prev.workspaceName,
              userRole: data.userRole || data.user_role || prev.userRole,
              industryFocus: data.industryFocus || data.industry_focus || prev.industryFocus,
              onboarded: data.onboarded || data.onboarding_completed || prev.onboarded,
              free_credits: data.free_credits !== undefined ? data.free_credits : prev.free_credits,
              subscription_status: planValue,
              status: statusValue,
            };
            localStorage.setItem('briefora_user', JSON.stringify(merged));
            localStorage.setItem('briefora_current_user', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        console.error('Failed to init profile:', err);
      }
    };

    initProfile();
  }, []);

  // Supabase Realtime Listener for live updates/deletions on profile row
  useEffect(() => {
    if (!user?.id || user.id.startsWith('usr-')) return;

    const channel = supabase
      .channel(`profile-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        async (payload: any) => {
          console.log('Realtime profile update received:', payload);
          if (payload.eventType === 'DELETE') {
            logout();
            window.location.href = '/login?notice=deleted';
          } else if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedProfile = payload.new;
            const statusValue = (updatedProfile.status?.toLowerCase() || 'active');
            
            if (statusValue === 'inactive' || statusValue === 'blocked') {
              console.warn(`Profile status updated to ${statusValue}, force signing out.`);
              logout();
              window.location.href = `/login?notice=${statusValue}`;
              return;
            }

            const planValue = (updatedProfile.plan?.toLowerCase() || 'free') as 'free' | 'starter' | 'pro' | 'studio';
            
            setUser((prev: any) => {
              if (!prev) return null;
              const merged = {
                ...prev,
                name: updatedProfile.name || prev.name,
                firstName: updatedProfile.firstName || updatedProfile.first_name || prev.firstName,
                lastName: updatedProfile.lastName || updatedProfile.last_name || prev.lastName,
                avatar: updatedProfile.avatar || prev.avatar,
                workspaceName: updatedProfile.workspaceName || updatedProfile.workspace_name || prev.workspaceName,
                userRole: updatedProfile.userRole || updatedProfile.user_role || prev.userRole,
                industryFocus: updatedProfile.industryFocus || updatedProfile.industry_focus || prev.industryFocus,
                onboarded: updatedProfile.onboarded || updatedProfile.onboarding_completed || prev.onboarded,
                free_credits: updatedProfile.free_credits !== undefined ? updatedProfile.free_credits : prev.free_credits,
                subscription_status: planValue,
                status: statusValue,
              };
              localStorage.setItem('briefora_user', JSON.stringify(merged));
              localStorage.setItem('briefora_current_user', JSON.stringify(merged));
              return merged;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const login = (email: string, role: 'user' | 'admin' = 'user', userObj?: User) => {
    const newUser: User = userObj || {
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role,
      free_credits: 1,
      subscription_status: 'free',
    };
    setUser(newUser);
    localStorage.setItem('briefora_user', JSON.stringify(newUser));
    localStorage.setItem('briefora_current_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('briefora_user');
    localStorage.removeItem('briefora_current_user');
    sessionStorage.removeItem('briefora_admin_authed');
    try {
      supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase auth signout error:', e);
    }
  };

  const decrementCredit = (): boolean => {
    if (!user) return false;
    const currentCredits = user.free_credits !== undefined ? user.free_credits : 1;
    if (currentCredits <= 0) {
      return false;
    }
    const updated = { ...user, free_credits: currentCredits - 1 };
    setUser(updated);
    localStorage.setItem('briefora_user', JSON.stringify(updated));
    localStorage.setItem('briefora_current_user', JSON.stringify(updated));

    if (user.id && !user.id.startsWith('usr-')) {
      supabase
        .from('profiles')
        .update({ free_credits: currentCredits - 1 })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) {
            console.warn('Failed to update free_credits in Supabase:', error);
          }
        });
    }

    return true;
  };

  const updateUser = (fields: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...fields };
    setUser(updated);
    localStorage.setItem('briefora_user', JSON.stringify(updated));
    localStorage.setItem('briefora_current_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || sessionStorage.getItem('briefora_admin_authed') === 'true',
        login,
        logout,
        decrementCredit,
        updateUser,
        searchQuery,
        setSearchQuery,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};