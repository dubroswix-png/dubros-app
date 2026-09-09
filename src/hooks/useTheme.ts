'use client';

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('dubros-theme') as Theme | null;
    
    // Default is always 'light' unless the user previously explicitly chose their preference
    const initialTheme: Theme = (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('dubros-theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return { theme, toggleTheme };
}
