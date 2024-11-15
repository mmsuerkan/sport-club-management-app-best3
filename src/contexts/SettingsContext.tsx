import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type Language = 'en' | 'tr';

interface Settings {
  theme: Theme;
  language: Language;
}

interface SettingsContextType {
  settings: Settings;
  updateTheme: (theme: Theme) => void;
  updateLanguage: (language: Language) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem('settings');
    return stored ? JSON.parse(stored) : { theme: 'light', language: 'en' };
  });

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings]);

  const updateTheme = (theme: Theme) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const updateLanguage = (language: Language) => {
    setSettings(prev => ({ ...prev, language }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateTheme, updateLanguage }}>
      {children}
    </SettingsContext.Provider>
  );
};