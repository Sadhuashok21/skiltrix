import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('skiltrix_theme') || localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved as Theme;
    }
    // Default to dark or system
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'dark';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('skiltrix_theme') || localStorage.getItem('theme');
    if (saved === 'light') return false;
    if (saved === 'dark') return true;
    return window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : true;
  });

  const applyThemeClasses = useCallback((dark: boolean) => {
    setIsDark(dark);
    const root = document.documentElement;
    const body = document.body;
    const rootDiv = document.getElementById('root');
    if (dark) {
      root.classList.add('dark');
      body?.classList.add('dark');
      rootDiv?.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      body?.classList.remove('dark');
      rootDiv?.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('skiltrix_theme', theme);
    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
      applyThemeClasses(true);
      return;
    }

    if (theme === 'light') {
      applyThemeClasses(false);
      return;
    }

    // System mode
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    applyThemeClasses(media.matches);

    const listener = (e: MediaQueryListEvent) => {
      applyThemeClasses(e.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme, applyThemeClasses]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const activeIsDark =
        prev === 'dark' ||
        (prev === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      return activeIsDark ? 'light' : 'dark';
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
