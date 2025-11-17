import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';

type Theme = 'light' | 'dark';
type AccentColor = 'teal' | 'blue' | 'purple';

interface ThemeContextType {
  theme: Theme;
  accentColor: AccentColor;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const accentColorMap: Record<AccentColor, Record<string, string>> = {
  teal: {
    '--color-accent-300': '107 235 208',
    '--color-accent-400': '45 212 191',
    '--color-accent-500': '20 184 166',
    '--color-accent-600': '13 148 136',
    '--color-accent-700': '15 118 110',
  },
  blue: {
    '--color-accent-300': '147 197 253',
    '--color-accent-400': '96 165 250',
    '--color-accent-500': '59 130 246',
    '--color-accent-600': '37 99 235',
    '--color-accent-700': '29 78 216',
  },
  purple: {
    '--color-accent-300': '196 181 253',
    '--color-accent-400': '167 139 250',
    '--color-accent-500': '139 92 246',
    '--color-accent-600': '124 58 237',
    '--color-accent-700': '109 40 217',
  }
};

const isTheme = (value: any): value is Theme => ['light', 'dark'].includes(value);
const isAccentColor = (value: any): value is AccentColor => ['teal', 'blue', 'purple'].includes(value);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [accentColor, setAccentColorState] = useState<AccentColor>('teal');

  useEffect(() => {
    const storedTheme = localStorage.getItem('ws_theme');
    const storedColor = localStorage.getItem('ws_accent_color');
    if (isTheme(storedTheme)) {
        setThemeState(storedTheme);
    } else {
        // Default to user's system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeState(prefersDark ? 'dark' : 'light');
    }
    if (isAccentColor(storedColor)) setAccentColorState(storedColor);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    // Handle theme
    if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
    localStorage.setItem('ws_theme', theme);

    // Handle accent color
    const colors = accentColorMap[accentColor];
    for (const [key, value] of Object.entries(colors)) {
      // FIX: The compiler in some environments might incorrectly infer the type of `value` from Object.entries as `unknown`.
      root.style.setProperty(key, value as string);
    }
    localStorage.setItem('ws_accent_color', accentColor);
  }, [theme, accentColor]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };
  
  const setAccentColor = (newColor: AccentColor) => {
    setAccentColorState(newColor);
  };

  const value = useMemo(() => ({ theme, accentColor, setTheme, setAccentColor }), [theme, accentColor]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
