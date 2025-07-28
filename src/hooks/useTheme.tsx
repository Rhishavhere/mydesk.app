import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<string>(() => {
    const stored = localStorage.getItem('theme');
    return stored || 'aurora';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-aurora', 'theme-sunset', 'theme-ocean');
    
    // Add the selected theme class
    root.classList.add(`theme-${theme}`);
    
    // Store in localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
};