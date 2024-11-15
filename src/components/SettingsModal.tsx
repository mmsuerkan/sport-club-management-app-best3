import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../locales/translations';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateTheme, updateLanguage } = useSettings();
  const t = translations[settings.language].settings;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.theme}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateTheme('light')}
                className={`px-4 py-2 rounded-lg border ${
                  settings.theme === 'light'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {t.light}
              </button>
              <button
                onClick={() => updateTheme('dark')}
                className={`px-4 py-2 rounded-lg border ${
                  settings.theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {t.dark}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.language}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateLanguage('en')}
                className={`px-4 py-2 rounded-lg border ${
                  settings.language === 'en'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {t.english}
              </button>
              <button
                onClick={() => updateLanguage('tr')}
                className={`px-4 py-2 rounded-lg border ${
                  settings.language === 'tr'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {t.turkish}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};