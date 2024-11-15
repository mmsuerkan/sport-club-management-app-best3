import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { translations } from '../../locales/translations';
import { db } from '../../lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { Report } from '../../types/finance';
import { Payment } from '../../types/payment';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import {
  Download,
  Calendar,
  Filter,
  FileText,
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon
} from 'lucide-react';

export const FinancialReports: React.FC = () => {
  const { settings } = useSettings();
  const { user, clubData } = useAuth();
  const t = translations[settings.language].finance;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('comprehensive');

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
      }
      setLoading(false);
    });

    return () => off(paymentsRef);
  }, [user, clubData]);

  const getFilteredPayments = () => {
    let filtered = [...payments];

    const now = new Date();
    if (dateRange === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter(p => new Date(p.createdAt) >= startOfMonth);
    } else if (dateRange === 'lastMonth') {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter(p => {
        const date = new Date(p.createdAt);
        return date >= startOfLastMonth && date < startOfThisMonth;
      });
    } else if (dateRange === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(p => {
        const date = new Date(p.createdAt);
        return date >= start && date <= end;
      });
    }

    return filtered;
  };

  const generateReportData = () => {
    const filteredPayments = getFilteredPayments();
    
    // Calculate totals
    const totalIncome = filteredPayments
      .filter(p => p.type === 'income')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalExpenses = filteredPayments
      .filter(p => p.type === 'expense')
      .reduce((sum, p) => sum + p.amount, 0);

    // Calculate category breakdown
    const categoryBreakdown = filteredPayments.reduce((acc, payment) => {
      const category = payment.category;
      if (!acc[category]) {
        acc[category] = { income: 0, expenses: 0 };
      }
      if (payment.type === 'income') {
        acc[category].income += payment.amount;
      } else {
        acc[category].expenses += payment.amount;
      }
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);

    // Prepare monthly trend data
    const monthlyData = filteredPayments.reduce((acc, payment) => {
      const date = new Date(payment.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = { income: 0, expenses: 0 };
      }
      
      if (payment.type === 'income') {
        acc[monthYear].income += payment.amount;
      } else {
        acc[monthYear].expenses += payment.amount;
      }
      
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);

    return {
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        net: totalIncome - totalExpenses
      },
      categoryBreakdown,
      monthlyTrend: Object.entries(monthlyData).map(([month, data]) => ({
        month,
        ...data,
        net: data.income - data.expenses
      }))
    };
  };

  const reportData = generateReportData();

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

  const handleExport = () => {
    const data = generateReportData();
    const reportContent = {
      title: 'Financial Report',
      dateRange: dateRange === 'custom' 
        ? `${startDate} to ${endDate}`
        : dateRange,
      summary: data.totals,
      categoryBreakdown: data.categoryBreakdown,
      monthlyTrend: data.monthlyTrend
    };

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Report Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Financial Reports
            </h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Generate and analyze financial reports
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="comprehensive">Comprehensive Report</option>
              <option value="income">Income Report</option>
              <option value="expense">Expense Report</option>
              <option value="category">Category Analysis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Total Income
              </p>
              <p className="text-2xl font-semibold text-green-700 dark:text-green-300">
                ${reportData.totals.income.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-800 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Total Expenses
              </p>
              <p className="text-2xl font-semibold text-red-700 dark:text-red-300">
                ${reportData.totals.expenses.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <PieChartIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Net Income
              </p>
              <p className="text-2xl font-semibold text-blue-700 dark:text-blue-300">
                ${reportData.totals.net.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200  dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Monthly Financial Trend
            </h3>
          </div>
          <div className="p-6">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.monthlyTrend}>
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
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10B981"
                    name="Income"
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#EF4444"
                    name="Expenses"
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#6366F1"
                    name="Net Income"
                    strokeWidth={2}
                    dot={{ fill: '#6366F1', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Category Analysis
            </h3>
          </div>
          <div className="p-6">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(reportData.categoryBreakdown).map(([category, data]) => ({
                    category,
                    income: data.income,
                    expenses: data.expenses,
                    net: data.income - data.expenses
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10B981" />
                  <Bar dataKey="expenses" name="Expenses" fill="#EF4444" />
                  <Bar dataKey="net" name="Net" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Transaction Details
            </h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Type</th>
                    <th className="pb-4">Category</th>
                    <th className="pb-4">Description</th>
                    <th className="pb-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {getFilteredPayments().map(payment => (
                    <tr key={payment.id} className="text-sm">
                      <td className="py-4 text-gray-900 dark:text-white">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.type === 'income'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {payment.type}
                        </span>
                      </td>
                      <td className="py-4 text-gray-900 dark:text-white">
                        {payment.category}
                      </td>
                      <td className="py-4 text-gray-900 dark:text-white">
                        {payment.description}
                      </td>
                      <td className="py-4 text-right font-medium text-gray-900 dark:text-white">
                        ${payment.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};