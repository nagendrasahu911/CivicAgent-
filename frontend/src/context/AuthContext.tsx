import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  fetchUnreadNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('civicsaathi_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<'en' | 'hi'>(
    (localStorage.getItem('civicsaathi_lang') as 'en' | 'hi') || 'en'
  );
  const [highContrast, setHighContrast] = useState<boolean>(
    localStorage.getItem('civicsaathi_contrast') === 'true'
  );
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadNotifications = async () => {
    const curToken = token || localStorage.getItem('civicsaathi_token');
    if (!curToken) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${curToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        const unread = data.filter((n: any) => n.is_read === 0).length;
        setUnreadCount(unread);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    localStorage.setItem('civicsaathi_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('civicsaathi_contrast', String(highContrast));
  }, [highContrast]);

  // Check current session on mount or auto-login with default citizen
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const savedToken = localStorage.getItem('civicsaathi_token');
      if (savedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            setToken(savedToken);
            setIsLoading(false);
            fetchUnreadNotifications();
            return;
          }
        } catch (e) {
          console.error("Auth check failed:", e);
        }
      }

      // If no valid session, switch to default demo citizen account for seamless review
      try {
        const res = await fetch('/api/auth/demo-switch/citizen', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(data.access_token);
          localStorage.setItem('civicsaathi_token', data.access_token);
          fetchUnreadNotifications();
        }
      } catch (err) {
        console.error("Demo auto-switch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Login failed");
        return false;
      }
      const data = await res.json();
      setUser(data.user);
      setToken(data.access_token);
      localStorage.setItem('civicsaathi_token', data.access_token);
      fetchUnreadNotifications();
      return true;
    } catch {
      alert("Network error connecting to backend API");
      return false;
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Registration failed");
        return false;
      }
      const resData = await res.json();
      setUser(resData.user);
      setToken(resData.access_token);
      localStorage.setItem('civicsaathi_token', resData.access_token);
      fetchUnreadNotifications();
      return true;
    } catch {
      alert("Network error during registration");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('civicsaathi_token');
  };

  const switchDemoRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/auth/demo-switch/${role}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.access_token);
        localStorage.setItem('civicsaathi_token', data.access_token);
        fetchUnreadNotifications();
      } else {
        alert("Could not switch role. Reset demo data in Admin tab.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
        language,
        setLanguage,
        highContrast,
        setHighContrast,
        unreadCount,
        setUnreadCount,
        fetchUnreadNotifications,
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
