import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'cursify-theme';

export const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'light';

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === 'dark' ? 'dark' : 'light';
};

export const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;

  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme === 'dark' ? 'dark' : 'light');
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return {
    theme,
    toggleTheme: () => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark')),
  };
};
