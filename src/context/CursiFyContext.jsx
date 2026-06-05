import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { applyTheme, getStoredTheme } from '../utils/theme';
import {
  clearAuthSession,
  getStoredAuthSession,
  saveAuthSession,
} from '../utils/authStorage';

const CursiFyContext = createContext(null);

export function CursiFyProvider({ children }) {
  const [theme, setTheme] = useState(getStoredTheme);
  const [authSession, setAuthSession] = useState(() => getStoredAuthSession());
  const [unreadChat, setUnreadChat] = useState(3);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (authSession) {
      saveAuthSession(authSession);
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
    login: (session) => setAuthSession(session),
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
