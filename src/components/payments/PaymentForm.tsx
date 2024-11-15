import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { translations } from '../../locales/translations';
import { Payment, PaymentType, PaymentCategory, PaymentStatus } from '../../types/payment';
import {
  Calendar,
  DollarSign,
  CreditCard,
  Tag,
  AlertCircle,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';

interface PaymentFormProps {
  payment?: Payment;
  onSubmit: (data: Partial<Payment>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  payment,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { settings } = useSettings();
  const t = translations[settings.language].payments;

  const [formData, setFormData] = useState({
    amount: payment?.amount?.toString() || '',
    type: payment?.type || 'income',
    category: payment?.category || 'membership',
    status: payment?.status || 'pending',
    description: payment?.description || '',
    dueDate: payment?.dueDate || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Type Selector */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
          className={`p-4 rounded-lg border-2 transition-colors ${
            formData.type === 'income'
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <ArrowUpCircle className={`w-6 h-6 mx-auto mb-2 ${
            formData.type === 'income'
              ? 'text-green-500'
              : 'text-gray-400'
          }`} />
          <div className={`text-sm font-medium ${
            formData.type === 'income'
              ? 'text-green-700 dark:text-green-300'
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {t.income}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
          className={`p-4 rounded-lg border-2 transition-colors ${
            formData.type === 'expense'
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <ArrowDownCircle className={`w-6 h-6 mx-auto mb-2 ${
            formData.type === 'expense'
              ? 'text-red-500'
              : 'text-gray-400'
          }`} />
          <div className={`text-sm font-medium ${
            formData.type === 'expense'
              ? 'text-red-700 dark:text-red-300'
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {t.expense}
          </div>
        </button>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t.amount}
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-semibold"
            required
          />
        </div>
      </div>

      {/* Category Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t.category}
        </label>
        <div className="relative">
          <Tag className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as PaymentCategory }))}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="membership">{t.categories.membership}</option>
            <option value="training">{t.categories.training}</option>
            <option value="tournament">{t.categories.tournament}</option>
            <option value="equipment">{t.categories.equipment}</option>
            <option value="facility">{t.categories.facility}</option>
            <option value="salary">{t.categories.salary}</option>
            <option value="other">{t.categories.other}</option>
          </select>
        </div>
      </div>

      {/* Status Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t.status}
        </label>
        <div className="relative">
          <AlertCircle className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PaymentStatus }))}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="pending">{t.statuses.pending}</option>
            <option value="completed">{t.statuses.completed}</option>
            <option value="failed">{t.statuses.failed}</option>
            <option value="refunded">{t.statuses.refunded}</option>
          </select>
        </div>
      </div>

      {/* Due Date Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t.dueDate}
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Description Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t.description}
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={loading || !formData.amount || !formData.description}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
        >
          {loading ? t.saving : (payment ? t.update : t.save)}
        </button>
      </div>
    </form>
  );
};