import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../locales/translations';
import { db } from '../lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import {
  Users,
  Layers,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Clock,
  Activity,
  Award,
  Target,
  ChevronRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalStudents: number;
  totalGroups: number;
  totalTrainers: number;
  totalIncome: number;
  totalExpenses: number;
  pendingPayments: number;
  upcomingClasses: any[];
  recentActivity: any[];
  monthlyStats: any[];
}

export const Dashboard: React.FC = () => {
  const { settings } = useSettings();
  const { user, clubData } = useAuth();
  const t = translations[settings.language].dashboard;
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalGroups: 0,
    totalTrainers: 0,
    totalIncome: 0,
    totalExpenses: 0,
    pendingPayments: 0,
    upcomingClasses: [],
    recentActivity: [],
    monthlyStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !clubData) return;

    const fetchStats = async () => {
      // Students count
      const studentsRef = ref(db, `clubs/${user.uid}/students`);
      const groupsRef = ref(db, `clubs/${user.uid}/branches`);
      const trainersRef = ref(db, `clubs/${user.uid}/trainers`);
      const paymentsRef = ref(db, `clubs/${user.uid}/payments`);
      const attendanceRef = ref(db, `clubs/${user.uid}/attendance`);

      onValue(studentsRef, (snapshot) => {
        let totalStudents = 0;
        if (snapshot.exists()) {
          Object.values(snapshot.val()).forEach((group: any) => {
            totalStudents += Object.keys(group).length;
          });
        }
        setStats(prev => ({ ...prev, totalStudents }));
      });

      // Groups count
      onValue(groupsRef, (snapshot) => {
        let totalGroups = 0;
        if (snapshot.exists()) {
          Object.values(snapshot.val()).forEach((branch: any) => {
            if (branch.groups) {
              totalGroups += Object.keys(branch.groups).length;
            }
          });
        }
        setStats(prev => ({ ...prev, totalGroups }));
      });

      // Trainers count
      onValue(trainersRef, (snapshot) => {
        const totalTrainers = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
        setStats(prev => ({ ...prev, totalTrainers }));
      });

      // Financial stats
      onValue(paymentsRef, (snapshot) => {
        let totalIncome = 0;
        let totalExpenses = 0;
        let pendingPayments = 0;
        const monthlyStats: { [key: string]: { income: number; expenses: number } } = {};

        if (snapshot.exists()) {
          Object.values(snapshot.val()).forEach((payment: any) => {
            if (payment.type === 'income') {
              totalIncome += payment.amount;
            } else {
              totalExpenses += payment.amount;
            }

            if (payment.status === 'pending') {
              pendingPayments++;
            }

            // Monthly stats
            const date = new Date(payment.createdAt);
            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            
            if (!monthlyStats[monthYear]) {
              monthlyStats[monthYear] = { income: 0, expenses: 0 };
            }
            
            if (payment.type === 'income') {
              monthlyStats[monthYear].income += payment.amount;
            } else {
              monthlyStats[monthYear].expenses += payment.amount;
            }
          });
        }

        const monthlyStatsArray = Object.entries(monthlyStats)
          .map(([month, data]) => ({
            month,
            income: data.income,
            expenses: data.expenses,
            profit: data.income - data.expenses
          }))
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

        setStats(prev => ({
          ...prev,
          totalIncome,
          totalExpenses,
          pendingPayments,
          monthlyStats: monthlyStatsArray
        }));
      });

      // Recent activity and upcoming classes
      onValue(attendanceRef, (snapshot) => {
        const upcomingClasses: any[] = [];
        if (snapshot.exists()) {
          // Process attendance data for upcoming classes
          // Implementation depends on your data structure
        }
        setStats(prev => ({ ...prev, upcomingClasses }));
      });

      setLoading(false);
    };

    fetchStats();

    return () => {
      // Cleanup listeners
      off(ref(db, `clubs/${user.uid}/students`));
      off(ref(db, `clubs/${user.uid}/branches`));
      off(ref(db, `clubs/${user.uid}/trainers`));
      off(ref(db, `clubs/${user.uid}/payments`));
      off(ref(db, `clubs/${user.uid}/attendance`));
    };
  }, [user, clubData]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t.totalStudents}
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Layers className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t.totalGroups}
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalGroups}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t.totalTrainers}
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalTrainers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t.pendingPayments}
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.pendingPayments}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Financial Overview
            </h2>
          </div>
          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyStats}>
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

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Financial Summary
              </h3>
              <button
                onClick={() => navigate('/finance/overview')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-400">Total Income</span>
                </div>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  ${stats.totalIncome.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-400">Total Expenses</span>
                </div>
                <span className="text-red-600 dark:text-red-400 font-medium">
                  ${stats.totalExpenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-400">Net Profit</span>
                </div>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  ${(stats.totalIncome - stats.totalExpenses).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/attendance')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="ml-3 text-gray-900 dark:text-white">Take Attendance</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={() => navigate('/payments/add')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="ml-3 text-gray-900 dark:text-white">Add Payment</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={() => navigate('/students')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="ml-3 text-gray-900 dark:text-white">Manage Students</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Upcoming Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.recentActivity}
            </h2>
          </div>
          <div className="p-6">
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center">
                    <Activity className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="flex-grow">
                      <p className="text-gray-900 dark:text-white">{activity.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t.noActivity}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.upcomingClasses}
            </h2>
          </div>
          <div className="p-6">
            {stats.upcomingClasses.length > 0 ? (
              <div className="space-y-4">
                {stats.upcomingClasses.map((class_, index) => (
                  <div key={index} className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="flex-grow">
                      <p className="text-gray-900 dark:text-white">{class_.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {class_.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t.noClasses}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};