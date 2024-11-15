import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { translations } from '../../locales/translations';
import { db } from '../../lib/firebase';
import { ref, onValue, off, push, update } from 'firebase/database';
import { Payment } from '../../types/payment';
import { PaymentList } from '../../components/payments/PaymentList';
import { PaymentForm } from '../../components/payments/PaymentForm';
import { ArrowLeft, CreditCard, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const PendingPayments: React.FC = () => {
  const { settings } = useSettings();
  const { user, clubData } = useAuth();
  const t = translations[settings.language].payments;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [overduePayments, setOverduePayments] = useState<Payment[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!user || !clubData) return;

    const paymentsRef = ref(db, `clubs/${user.uid}/payments`);
    
    onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const paymentList = Object.entries(data)
          .map(([id, payment]) => ({
            id,
            ...(payment as any),
          }))
          .filter(p => p.status === 'pending')
          .sort((a, b) => {
            if (a.dueDate && b.dueDate) {
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            return b.createdAt - a.createdAt;
          });

        const now = new Date();
        const overdue = paymentList.filter(p => 
          p.dueDate && new Date(p.dueDate) < now
        );
        const upcoming = paymentList.filter(p => 
          !p.dueDate || new Date(p.dueDate) >= now
        );

        setPayments(paymentList);
        setOverduePayments(overdue);
        setUpcomingPayments(upcoming);
      }
      setLoading(false);
    });

    return () => off(paymentsRef);
  }, [user, clubData]);

  const handleAddPayment = async (data: Partial<Payment>) => {
    if (!user || !clubData) return;

    try {
      const paymentsRef = ref(db, `clubs/${user.uid}/payments`);
      await push(paymentsRef, {
        ...data,
        createdAt: Date.now(),
      });

      toast.success(t.success.add);
    } catch (error) {
      toast.error(t.error.add);
    }
  };

  const handleUpdatePayment = async (data: Partial<Payment>) => {
    if (!user || !clubData || !editingPayment) return;

    try {
      const paymentRef = ref(db, `clubs/${user.uid}/payments/${editingPayment.id}`);
      await update(paymentRef, data);

      setEditingPayment(null);
      toast.success(t.success.update);
    } catch (error) {
      toast.error(t.error.update);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Payment Form Section */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingPayment ? t.update : t.addPayment}
            </h2>
            {editingPayment && (
              <button
                onClick={() => setEditingPayment(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>
          <PaymentForm
            payment={editingPayment || undefined}
            onSubmit={editingPayment ? handleUpdatePayment : handleAddPayment}
            onCancel={() => setEditingPayment(null)}
          />
        </div>
      </div>

      {/* Sidebar Section */}
      <div className="space-y-6">
        {/* Overdue Payments */}
        {overduePayments.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm border border-red-200 dark:border-red-800">
            <div className="p-4 border-b border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Overdue Payments
              </h3>
            </div>
            <div className="p-4">
              <PaymentList
                payments={overduePayments}
                loading={loading}
                onEdit={setEditingPayment}
              />
            </div>
          </div>
        )}

        {/* Upcoming Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Upcoming Payments
            </h3>
          </div>
          <div className="p-4">
            <PaymentList
              payments={upcomingPayments}
              loading={loading}
              onEdit={setEditingPayment}
            />
          </div>
        </div>

        {/* Payment Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Pending
              </h4>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {payments.length}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Amount
              </h4>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};