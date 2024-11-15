import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { translations } from '../../locales/translations';
import { Payment } from '../../types/payment';
import {
  Calendar,
  DollarSign,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface PaymentListProps {
  payments: Payment[];
  onEdit?: (payment: Payment) => void;
  loading?: boolean;
  showStatus?: boolean;
}

export const PaymentList: React.FC<PaymentListProps> = ({
  payments,
  onEdit,
  loading = false,
  showStatus = true
}) => {
  const { settings } = useSettings();
  const t = translations[settings.language].payments;

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'refunded':
        return <RefreshCw className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8">
        <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No payments found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map(payment => (
        <div
          key={payment.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer group"
          onClick={() => onEdit?.(payment)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-grow">
              <div className="flex items-center space-x-3 mb-2">
                {showStatus && (
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(payment.status)}
                    <span className={`text-sm font-medium ${getStatusColor(payment.status)} px-2 py-1 rounded-full`}>
                      {t.statuses[payment.status]}
                    </span>
                  </div>
                )}
                <span className={`text-lg font-semibold ${
                  payment.type === 'income'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {payment.type === 'income' ? '+' : '-'}${payment.amount.toLocaleString()}
                </span>
              </div>
              <p className="text-gray-900 dark:text-white mb-3">{payment.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {payment.dueDate
                    ? new Date(payment.dueDate).toLocaleDateString()
                    : new Date(payment.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  {t.categories[payment.category]}
                </div>
                {payment.studentId && (
                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                    <span className="font-medium">Student Payment</span>
                  </div>
                )}
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <span className="sr-only">Edit payment</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};