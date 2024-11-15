import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { translations } from '../../locales/translations';
import { db } from '../../lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { Payment, PaymentStats } from '../../types/payment';
import { PaymentList } from '../../components/payments/PaymentList';
import { PaymentStats as PaymentStatsComponent } from '../../components/payments/PaymentStats';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle } from 'lucide-react';

export const PaymentOverview: React.FC = () => {
  const { settings } = useSettings();
  const { user, clubData } = useAuth();
  const t = translations[settings.language].payments;
  const navigate = useNavigate();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalIncome: 0,
    totalExpenses: 0,
    pendingPayments: 0,
    monthlyIncome: {},
    monthlyExpenses: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !clubData) return;

    const paymentsRef = ref(db, `clubs/${user.uid}/payments`);
    
    onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const paymentList = Object.entries(data).map(([id, payment]) => ({
          id,
          ...(payment as any),
        })).sort((a, b) => b.createdAt - a.createdAt);

        setPayments(paymentList);

        // Calculate stats
        const stats: PaymentStats = {
          totalIncome: 0,
          totalExpenses: 0,
          pendingPayments: 0,
          monthlyIncome: {},
          monthlyExpenses: {}
        };

        paymentList.forEach(payment => {
          if (payment.type === 'income') {
            stats.totalIncome += payment.amount;
          } else {
            stats.totalExpenses += payment.amount;
          }

          if (payment.status === 'pending') {
            stats.pendingPayments++;
          }

          const date = new Date(payment.createdAt);
          const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });

          if (payment.type === 'income') {
            stats.monthlyIncome[monthYear] = (stats.monthlyIncome[monthYear] || 0) + payment.amount;
          } else {
            stats.monthlyExpenses[monthYear] = (stats.monthlyExpenses[monthYear] || 0) + payment.amount;
          }
        });

        setStats(stats);
      }
      setLoading(false);
    });

    return () => off(paymentsRef);
  }, [user, clubData]);

  // Get overdue payments
  const overduePayments = payments.filter(payment => {
    if (payment.status === 'pending' && payment.dueDate) {
      return new Date(payment.dueDate) < new Date();
    }
    return false;
  });

  return (
    <div className="space-y-8">
      {overduePayments.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Attention Required
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>You have {overduePayments.length} overdue {overduePayments.length === 1 ? 'payment' : 'payments'}.</p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    onClick={() => navigate('/payments/history')}
                    className="px-3 py-2 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    View details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <PaymentStatsComponent stats={stats} loading={loading} />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Income
            </h2>
            <button
              onClick={() => navigate('/payments/pending')}
              className="flex items-center px-3 py-1.5 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Income
            </button>
          </div>
          <div className="p-6">
            <PaymentList
              payments={payments.filter(p => p.type === 'income').slice(0, 5)}
              loading={loading}
              showStatus={false}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Expenses
            </h2>
            <button
              onClick={() => navigate('/payments/pending')}
              className="flex items-center px-3 py-1.5 text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Expense
            </button>
          </div>
          <div className="p-6">
            <PaymentList
              payments={payments.filter(p => p.type === 'expense').slice(0, 5)}
              loading={loading}
              showStatus={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};