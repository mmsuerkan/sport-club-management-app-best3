import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../locales/translations';
import { PaymentOverview } from './payments/PaymentOverview';
import { PaymentHistory } from './payments/PaymentHistory';
import { PendingPayments } from './payments/PendingPayments';

export const Payments: React.FC = () => {
  const { settings } = useSettings();
  const t = translations[settings.language].payments;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Routes>
          <Route path="overview" element={<PaymentOverview />} />
          <Route path="history" element={<PaymentHistory />} />
          <Route path="pending" element={<PendingPayments />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Routes>
      </div>
    </div>
  );
};