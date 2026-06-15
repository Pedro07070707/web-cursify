import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { applyTheme, getStoredTheme } from '../utils/theme';
import {
  clearAuthSession,
  getStoredAuthSession,
  saveAuthSession,
} from '../utils/authStorage';

const CursiFyContext = createContext(null);

const normalizeSession = (session) => {
  if (!session?.user) return session;
  const role = session.user.role || session.user.nivelAcesso || 'USUARIO';
  return {
    ...session,
    user: {
      ...session.user,
      role,
      nivelAcesso: session.user.nivelAcesso || role,
    },
  };
};

export function CursiFyProvider({ children }) {
  const [theme, setTheme] = useState(getStoredTheme);
  const [authSession, setAuthSession] = useState(() => normalizeSession(getStoredAuthSession()));
  const [unreadChat, setUnreadChat] = useState(3);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (authSession) {
      saveAuthSession(normalizeSession(authSession));
    }
  }, [authSession]);

  const value = useMemo(() => ({
    authUser: authSession?.user || null,
    accessToken: authSession?.accessToken || null,
    refreshToken: authSession?.refreshToken || null,
    theme,
    toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    logout: () => {
      setAuthSession(null);
      clearAuthSession();
    },
    login: (session) => setAuthSession(normalizeSession(session)),
    unreadChat,
    setUnreadChat,
    notifications,
    setNotifications,
  }), [authSession, theme, unreadChat, notifications]);

  return <CursiFyContext.Provider value={value}>{children}</CursiFyContext.Provider>;
}

export const useCursiFy = () => {
  const context = useContext(CursiFyContext);
  if (!context) {
    throw new Error('useCursiFy must be used inside CursiFyProvider');
  }
  return context;
};
