import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../locales/translations';
import { db } from '../lib/firebase';
import { ref, push, update, remove, onValue, off } from 'firebase/database';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Clock,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Match {
  id: string;
  date: string;
  time: string;
  location: string;
  opponent: string;
  homeTeam: boolean;
  status: 'upcoming' | 'in_progress' | 'completed';
  score?: {
    home: number;
    away: number;
  };
  players: {
    [key: string]: {
      minutes: number;
      points: number;
      assists: number;
      rebounds: number;
    };
  };
  notes: string;
  createdAt: number;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface MatchModalProps {
  match?: Match;
  onClose: () => void;
  onSave: (data: Partial<Match>) => void;
  students: Student[];
}

const MatchModal: React.FC<MatchModalProps> = ({ match, onClose, onSave, students }) => {
  const { settings } = useSettings();
  const t = translations[settings.language].matchSchedule;

  const [formData, setFormData] = useState({
    date: match?.date || new Date().toISOString().split('T')[0],
    time: match?.time || '',
    location: match?.location || '',
    opponent: match?.opponent || '',
    homeTeam: match?.homeTeam ?? true,
    status: match?.status || 'upcoming',
    score: match?.score || { home: 0, away: 0 },
    notes: match?.notes || ''
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {match ? t.editMatch : t.addMatch}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.date}
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.time}
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.location}
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={t.locationPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.opponent}
            </label>
            <input
              type="text"
              value={formData.opponent}
              onChange={(e) => setFormData(prev => ({ ...prev, opponent: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={t.opponentPlaceholder}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={formData.homeTeam}
                onChange={() => setFormData(prev => ({ ...prev, homeTeam: true }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t.homeTeam}</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={!formData.homeTeam}
                onChange={() => setFormData(prev => ({ ...prev, homeTeam: false }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t.awayTeam}</span>
            </label>
          </div>

          {match?.status === 'completed' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.homeScore}
                </label>
                <input
                  type="number"
                  value={formData.score.home}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    score: { ...prev.score, home: parseInt(e.target.value) }
                  }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.awayScore}
                </label>
                <input
                  type="number"
                  value={formData.score.away}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    score: { ...prev.score, away: parseInt(e.target.value) }
                  }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.notes}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={t.notesPlaceholder}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={() => onSave(formData)}
              disabled={!formData.date || !formData.time || !formData.location || !formData.opponent}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {match ? t.update : t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MatchSchedule: React.FC = () => {
  const { settings } = useSettings();
  const { user, clubData } = useAuth();
  const t = translations[settings.language].matchSchedule;

  const [matches, setMatches] = useState<Match[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isAddingMatch, setIsAddingMatch] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<Match['status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || !clubData) return;

    const matchesRef = ref(db, `clubs/${user.uid}/matches`);
    
    onValue(matchesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const matchList = Object.entries(data).map(([id, match]) => ({
          id,
          ...(match as any),
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Update match statuses based on date
        const now = new Date();
        matchList.forEach(match => {
          const matchDate = new Date(match.date);
          if (matchDate < now && match.status === 'upcoming') {
            match.status = 'completed';
            // Update in database
            update(ref(db, `clubs/${user.uid}/matches/${match.id}`), {
              status: 'completed'
            });
          }
        });

        setMatches(matchList);
      } else {
        setMatches([]);
      }
    });

    return () => off(matchesRef);
  }, [user, clubData]);

  useEffect(() => {
    if (!user || !clubData) return;

    const studentsRef = ref(db, `clubs/${user.uid}/students`);
    
    onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const studentList = Object.entries(data).map(([id, student]) => ({
          id,
          ...(student as any),
        }));
        setStudents(studentList);
      } else {
        setStudents([]);
      }
    });

    return () => off(studentsRef);
  }, [user, clubData]);

  const handleAddMatch = async (data: Partial<Match>) => {
    if (!user || !clubData) return;

    try {
      const matchesRef = ref(db, `clubs/${user.uid}/matches`);
      await push(matchesRef, {
        ...data,
        createdAt: Date.now(),
      });

      setIsAddingMatch(false);
      toast.success(t.success.add);
    } catch (error) {
      toast.error(t.error.add);
    }
  };

  const handleUpdateMatch = async (matchId: string, data: Partial<Match>) => {
    if (!user || !clubData) return;

    try {
      const matchRef = ref(db, `clubs/${user.uid}/matches/${matchId}`);
      await update(matchRef, data);

      setSelectedMatch(null);
      toast.success(t.success.update);
    } catch (error) {
      toast.error(t.error.update);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!user || !clubData || !window.confirm(t.confirmDelete)) return;

    try {
      const matchRef = ref(db, `clubs/${user.uid}/matches/${matchId}`);
      await remove(matchRef);
      toast.success(t.success.delete);
    } catch (error) {
      toast.error(t.error.delete);
    }
  };

  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredMatches = matches
    .filter(match => filterStatus === 'all' || match.status === filterStatus)
    .filter(match => 
      match.opponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add padding days from previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({ date: prevDate, isCurrentMonth: false });
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Add padding days from next month
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const calendarDays = getDaysInMonth(currentMonth);

  if (!clubData) return null;

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
        <button
          onClick={() => setIsAddingMatch(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t.addMatch}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-lg"
              >
                {t.today}
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800"
              >
                {day}
              </div>
            ))}
            {calendarDays.map(({ date, isCurrentMonth }, index) => {
              const dateStr = date.toISOString().split('T')[0];
              const dayMatches = matches.filter(m => m.date === dateStr);
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 ${
                    isCurrentMonth
                      ? 'bg-white dark:bg-gray-800'
                      : 'bg-gray-50 dark:bg-gray-900'
                  }`}
                >
                  <div className={`text-sm ${
                    isCurrentMonth
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1 mt-1">
                    {dayMatches.map(match => (
                      <button
                        key={match.id}
                        onClick={() => setSelectedMatch(match)}
                        className={`w-full text-left text-xs p-1 rounded ${getStatusColor(match.status)}`}
                      >
                        {match.time} - {match.opponent}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters and List View */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.filters}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.status}
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as Match['status'] | 'all')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">{t.allMatches}</option>
                  <option value="upcoming">{t.upcoming}</option>
                  <option value="in_progress">{t.inProgress}</option>
                  <option value="completed">{t.completed}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.search}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredMatches.map(match => (
              <div
                key={match.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => setSelectedMatch(match)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(match.status)}`}>
                        {t[match.status]}
                      </span>
                      {match.status === 'completed' && (
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {match.score?.home} - {match.score?.away}
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                      {match.homeTeam ? clubData.clubName : match.opponent} vs {match.homeTeam ? match.opponent : clubData.clubName}
                    </h4>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(match.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {match.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {match.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredMatches.length === 0 && (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t.noMatches}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {(isAddingMatch || selectedMatch) && (
        <MatchModal
          match={selectedMatch || undefined}
          onClose={() => {
            setIsAddingMatch(false);
            setSelectedMatch(null);
          }}
          onSave={(data) => {
            if (selectedMatch) {
              handleUpdateMatch(selectedMatch.id, data);
            } else {
              handleAddMatch(data);
            }
          }}
          students={students}
        />
      )}
    </div>
  );
};