import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../locales/translations';
import { FinanceOverview } from './finance/FinanceOverview';
import { ExpenseManagement } from './finance/ExpenseManagement';
import { BudgetPlanning } from './finance/BudgetPlanning';
import { FinancialReports } from './finance/FinancialReports';

export const Finance: React.FC = () => {
  const { settings } = useSettings();
  const t = translations[settings.language].finance;

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
          <Route path="overview" element={<FinanceOverview />} />
          <Route path="expenses" element={<ExpenseManagement />} />
          <Route path="budget" element={<BudgetPlanning />} />
          <Route path="reports" element={<FinancialReports />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Routes>
      </div>
    </div>
  );
};