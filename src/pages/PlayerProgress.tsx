import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../locales/translations';

export const PlayerProgress: React.FC = () => {
  const { settings } = useSettings();
  const t = translations[settings.language].pages;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {t.playerProgress}
      </h1>
    </div>
  );
};