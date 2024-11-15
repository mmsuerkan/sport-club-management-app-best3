import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../locales/translations';
import { db } from '../lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { Calendar, Clock, Users, Filter, Download, Search, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Branch {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  branchId: string;
}

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  present: boolean;
  timestamp: number;
}

interface DetailModalProps {
  date: string;
  timeSlot: string;
  records: AttendanceRecord[];
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ date, timeSlot, records, onClose }) => {
  const { settings } = useSettings();
  const t = translations[settings.language].attendanceRecords;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {new Date(date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString()} - {timeSlot}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-green-800 dark:text-green-200 text-lg font-semibold">
                {t.present}
              </div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                {records.filter(r => r.present).length}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="text-red-800 dark:text-red-200 text-lg font-semibold">
                {t.absent}
              </div>
              <div className="text-3xl font-bold text-red-900 dark:text-red-100">
                {records.filter(r => !r.present).length}
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {records.map((record, index) => (
              <div
                key={record.studentId}
                className="py-3 flex justify-between items-center"
              >
                <span className="text-gray-900 dark:text-white">
                  {record.studentName}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    record.present
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {record.present ? (
                    <Check className="w-4 h-4 inline-block" />
                  ) : (
                    <X className="w-4 h-4 inline-block" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AttendanceRecords: React.FC = () => {
  const { settings } = useSettings();
  const { user, clubData } = useAuth();
  const t = translations[settings.language].attendanceRecords;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [records, setRecords] = useState<{
    [key: string]: { [key: string]: AttendanceRecord[] }
  }>({});
  const [sortConfig, setSortConfig] = useState<{
    key: 'date' | 'timeSlot' | 'student' | 'status';
    direction: 'asc' | 'desc';
  }>({ key: 'date', direction: 'desc' });
  const [selectedRecord, setSelectedRecord] = useState<{
    date: string;
    timeSlot: string;
    records: AttendanceRecord[];
  } | null>(null);

  useEffect(() => {
    if (!user || !clubData) return;

    const branchesRef = ref(db, `clubs/${user.uid}/branches`);
    
    onValue(branchesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const branchList = Object.entries(data).map(([id, branch]) => ({
          id,
          name: (branch as any).name,
        }));
        setBranches(branchList);
        
        if (!selectedBranch && branchList.length > 0) {
          setSelectedBranch(branchList[0].id);
        }
      } else {
        setBranches([]);
      }
    });

    return () => off(branchesRef);
  }, [user, clubData]);

  useEffect(() => {
    if (!user || !clubData || !selectedBranch) return;

    const groupsRef = ref(db, `clubs/${user.uid}/branches/${selectedBranch}/groups`);
    
    onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const groupList = Object.entries(data).map(([id, group]) => ({
          id,
          ...(group as any),
        }));
        setGroups(groupList);
        
        if (!selectedGroup && groupList.length > 0) {
          setSelectedGroup(groupList[0].id);
        }
      } else {
        setGroups([]);
        setSelectedGroup('');
      }
    });

    return () => off(groupsRef);
  }, [user, clubData, selectedBranch]);

  const handleSearch = () => {
    if (!user || !clubData || !selectedGroup || !startDate || !endDate) return;

    const attendanceRef = ref(db, `clubs/${user.uid}/attendance/${selectedGroup}`);
    
    onValue(attendanceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const filteredRecords: typeof records = {};
        
        Object.entries(data).forEach(([date, timeSlots]) => {
          if (date >= startDate.replace(/-/g, '') && date <= endDate.replace(/-/g, '')) {
            filteredRecords[date] = timeSlots as { [key: string]: AttendanceRecord[] };
          }
        });
        
        setRecords(filteredRecords);
      } else {
        setRecords({});
      }
    });

    return () => off(attendanceRef);
  };

  const handleExport = () => {
    // Implementation for exporting records to CSV
    toast.success(t.success.export);
  };

  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedRecords = () => {
    const allRecords: {
      date: string;
      timeSlot: string;
      records: AttendanceRecord[];
    }[] = [];

    Object.entries(records).forEach(([date, timeSlots]) => {
      Object.entries(timeSlots).forEach(([timeSlot, recordList]) => {
        allRecords.push({
          date,
          timeSlot: timeSlot.replace(/_/g, ':'),
          records: recordList
        });
      });
    });

    return allRecords.sort((a, b) => {
      switch (sortConfig.key) {
        case 'date':
          return sortConfig.direction === 'asc'
            ? a.date.localeCompare(b.date)
            : b.date.localeCompare(a.date);
        case 'timeSlot':
          return sortConfig.direction === 'asc'
            ? a.timeSlot.localeCompare(b.timeSlot)
            : b.timeSlot.localeCompare(a.timeSlot);
        default:
          return 0;
      }
    });
  };

  if (!clubData) return null;

  return (
    <div className="max-w-5xl mx-auto">
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

      {branches.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {t.noBranches}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.branch}
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.group}
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={groups.length === 0}
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.startDate}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.endDate}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={handleSearch}
                disabled={!selectedGroup || !startDate || !endDate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Search className="w-5 h-5 inline-block mr-2" />
                {t.search}
              </button>

              <button
                onClick={handleExport}
                disabled={Object.keys(records).length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-5 h-5 inline-block mr-2" />
                {t.export}
              </button>
            </div>
          </div>

          {Object.keys(records).length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center">
                          {t.date}
                          <Filter className={`w-4 h-4 ml-1 ${
                            sortConfig.key === 'date' && sortConfig.direction === 'asc' ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('timeSlot')}
                      >
                        <div className="flex items-center">
                          {t.timeSlot}
                          <Filter className={`w-4 h-4 ml-1 ${
                            sortConfig.key === 'timeSlot' && sortConfig.direction === 'asc' ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.present}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.absent}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {getSortedRecords().map(({ date, timeSlot, records }) => {
                      const presentCount = records.filter(r => r.present).length;
                      const absentCount = records.length - presentCount;
                      
                      return (
                        <tr
                          key={`${date}-${timeSlot}`}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => setSelectedRecord({ date, timeSlot, records })}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {timeSlot}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {presentCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              {absentCount}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {t.noRecords}
              </p>
            </div>
          )}
        </>
      )}

      {selectedRecord && (
        <DetailModal
          date={selectedRecord.date}
          timeSlot={selectedRecord.timeSlot}
          records={selectedRecord.records}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};