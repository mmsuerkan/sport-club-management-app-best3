import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { translations } from '../../locales/translations';
import { db } from '../../lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { FinancialMetric } from '../../types/finance';
import { Payment } from '../../types/payment';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';

export const FinanceOverview: React.FC = () => {
  const { settings } = useSettings();
  const { user, clubData } = useAuth();
  const t = translations[settings.language].finance;

  const [metrics, setMetrics] = useState<FinancialMetric[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !clubData) return;

    const paymentsRef = ref(db, `clubs/${user.uid}/payments`);
    
    onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const payments = Object.values(data) as Payment[];
        
        // Calculate metrics
        const totalIncome = payments
          .filter(p => p.type === 'income')
          .reduce((sum, p) => sum + p.amount, 0);

        const totalExpenses = payments
          .filter(p => p.type === 'expense')
          .reduce((sum, p) => sum + p.amount, 0);

        const netIncome = totalIncome - totalExpenses;

        // Calculate month-over-month changes
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        const lastMonthIncome = payments
          .filter(p => p.type === 'income' && new Date(p.createdAt) >= lastMonth)
          .reduce((sum, p) => sum + p.amount, 0);

        const lastMonthExpenses = payments
          .filter(p => p.type === 'expense' && new Date(p.createdAt) >= lastMonth)
          .reduce((sum, p) => sum + p.amount, 0);

        const lastMonthNet = lastMonthIncome - lastMonthExpenses;

        // Prepare chart data
        const monthlyData: { [key: string]: { income: number; expenses: number } } = {};
        
        payments.forEach(payment => {
          const date = new Date(payment.createdAt);
          const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          
          if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { income: 0, expenses: 0 };
          }
          
          if (payment.type === 'income') {
            monthlyData[monthYear].income += payment.amount;
          } else {
            monthlyData[monthYear].expenses += payment.amount;
          }
        });

        const chartData = Object.entries(monthlyData)
          .map(([month, data]) => ({
            month,
            income: data.income,
            expenses: data.expenses,
            profit: data.income - data.expenses
          }))
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

        setChartData(chartData);
        setMetrics([
          {
            id: '1',
            name: 'Total Income',
            value: totalIncome,
            change: ((totalIncome - lastMonthIncome) / lastMonthIncome) * 100,
            trend: totalIncome >= lastMonthIncome ? 'up' : 'down',
            period: 'vs. last month'
          },
          {
            id: '2',
            name: 'Total Expenses',
            value: totalExpenses,
            change: ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100,
            trend: totalExpenses <= lastMonthExpenses ? 'up' : 'down',
            period: 'vs. last month'
          },
          {
            id: '3',
            name: 'Net Income',
            value: netIncome,
            change: ((netIncome - lastMonthNet) / lastMonthNet) * 100,
            trend: netIncome >= lastMonthNet ? 'up' : 'down',
            period: 'vs. last month'
          }
        ]);
      }
      setLoading(false);
    });

    return () => off(paymentsRef);
  }, [user, clubData]);

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className={`text-sm ${
                entry.name === 'income'
                  ? 'text-green-600 dark:text-green-400'
                  : entry.name === 'expenses'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map(metric => (
          <div
            key={metric.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {metric.name}
              </span>
              <div className={`flex items-center space-x-1 text-sm ${
                metric.trend === 'up'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {getTrendIcon(metric.trend)}
                <span>{Math.abs(metric.change).toFixed(1)}%</span>
              </div>
            </div>
            <div className="mt-2 flex items-baseline">
              <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${metric.value.toLocaleString()}
              </span>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                {metric.period}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Financial Overview
          </h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis
                  dataKey="month"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};