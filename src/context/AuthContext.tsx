import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, role?: 'user' | 'admin') => void;
  logout: () => void;
  decrementCredit: () => boolean;
  updateUser: (fields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const login = (email: string, role: 'user' | 'admin' = 'user') => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role,
      free_credits: 1,
      subscription_status: 'free',
    };
    setUser(newUser);
    localStorage.setItem('briefora_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('briefora_user');
    localStorage.removeItem('briefora_current_user');
    sessionStorage.removeItem('briefora_admin_authed');
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