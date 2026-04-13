import { useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light' | 'system';

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;
  if (resolved === 'light') {
    root.classList.add('light');
  } else {
    root.classList.remove('light');
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('samir-theme') as Theme | null;
    return stored || 'dark';
  });

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('samir-theme', newTheme);
    applyTheme(newTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const resolvedTheme: 'dark' | 'light' = theme === 'system' ? getSystemTheme() : theme;

  return { theme, setTheme, resolvedTheme };
}
