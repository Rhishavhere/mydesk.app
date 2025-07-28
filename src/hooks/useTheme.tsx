import { useState, useEffect } from 'react';

const themes = ['aurora', 'sunset', 'ocean'];

export const useTheme = () => {
  const [theme, setTheme] = useState<string>(() => {
    const stored = localStorage.getItem('theme');
    return stored || 'aurora';
  });
  const [isAutomatic, setIsAutomatic] = useState<boolean>(() => {
    const stored = localStorage.getItem('autoTheme');
    return stored === 'true';
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

  useEffect(() => {
    localStorage.setItem('autoTheme', isAutomatic.toString());
    
    if (!isAutomatic) return;

    const interval = setInterval(() => {
      setTheme(currentTheme => {
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        return themes[nextIndex];
      });
    }, 8000); // Change theme every 8 seconds

    return () => clearInterval(interval);
  }, [isAutomatic]);

  return { theme, setTheme, isAutomatic, setIsAutomatic };
};