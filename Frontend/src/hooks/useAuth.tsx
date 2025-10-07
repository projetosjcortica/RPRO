import React, { createContext, useContext, useEffect, useState } from 'react';

type User = { id: number; username: string; displayName?: string; photoPath?: string; isAdmin?: boolean } | null;

const STORAGE_KEY = 'rpro_user';

type AuthContextValue = {
  user: User;
  login: (username: string, password: string) => Promise<any>;
  register: (username: string, password: string, displayName?: string) => Promise<any>;
  logout: () => void;
  refresh: () => void;
  updateUser: (u: User) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }, [user]);

  const login = async (username: string, password: string) => {
    const res = await fetch(`http://localhost:3000/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const data = await res.json();
    setUser(data);
    return data;
  };

  const register = async (username: string, password: string, displayName?: string) => {
    const res = await fetch(`http://localhost:3000/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, displayName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || 'register failed');
    }
    const data = await res.json();
    setUser(data);
    return data;
  };

  const logout = () => {
    setUser(null);
  };

  const refresh = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setUser(raw ? JSON.parse(raw) : null);
    } catch (e) {
      setUser(null);
    }
  };

  const updateUser = (u: User) => {
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refresh, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export default useAuth;
