// src/contexts/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // İlk yüklemede localStorage’dan çek
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    // Sistem teması varsa onu kullan
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // HTML <html> elementine dark class’ını senkronize et
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook şeklinde kullanım kolaylığı
export const useTheme = () => useContext(ThemeContext);
