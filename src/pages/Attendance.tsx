import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../locales/translations';
import { db } from '../lib/firebase';
import { ref, set, onValue, off } from 'firebase/database';
import { Calendar, Clock, Users, Check, X } from 'lucide-react';
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

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

export const Attendance: React.FC = () => {
  const { settings } = useSettings();
  const { user, clubData } = useAuth();
  const t = translations[settings.language].attendance;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    if (!user || !clubData || !selectedGroup) return;

    const studentsRef = ref(db, `clubs/${user.uid}/students/${selectedGroup}`);
    
    onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const studentList = Object.entries(data).map(([id, student]) => ({
          id,
          ...(student as any),
        }));
        setStudents(studentList);
        
        // Initialize attendance state for all students
        const initialAttendance = studentList.reduce((acc, student) => ({
          ...acc,
          [student.id]: false
        }), {});
        setAttendance(initialAttendance);
      } else {
        setStudents([]);
        setAttendance({});
      }
    });

    return () => off(studentsRef);
  }, [user, clubData, selectedGroup]);

  const handleSaveAttendance = async () => {
    if (!user || !clubData || !selectedGroup || !selectedTimeSlot) return;

    try {
      setSaving(true);
      // Format date as YYYYMMDD
      const formattedDate = selectedDate.replace(/-/g, '');
      // Format time slot for valid Firebase path
      const formattedTimeSlot = selectedTimeSlot.replace(/:/g, '_');
      
      // Create attendance records for each student
      const attendanceRecords = students.map(student => ({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        present: attendance[student.id] || false,
        timestamp: Date.now()
      }));

      // Save attendance records
      const attendanceRef = ref(
        db,
        `clubs/${user.uid}/attendance/${selectedGroup}/${formattedDate}/${formattedTimeSlot}`
      );

      await set(attendanceRef, attendanceRecords);
      toast.success(t.success.save);
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error(t.error.save);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAll = (present: boolean) => {
    const newAttendance = students.reduce((acc, student) => ({
      ...acc,
      [student.id]: present
    }), {});
    setAttendance(newAttendance);
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
                  {t.date}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.timeSlot}
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="time"
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {students.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t.studentList}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleMarkAll(true)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                  >
                    {t.markAllPresent}
                  </button>
                  <button
                    onClick={() => handleMarkAll(false)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  >
                    {t.markAllAbsent}
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <span className="text-gray-900 dark:text-white">
                      {student.firstName} {student.lastName}
                    </span>
                    <button
                      onClick={() => setAttendance(prev => ({
                        ...prev,
                        [student.id]: !prev[student.id]
                      }))}
                      className={`p-2 rounded-lg transition-colors ${
                        attendance[student.id]
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {attendance[student.id] ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSaveAttendance}
                  disabled={saving || !selectedTimeSlot}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? t.saving : t.saveAttendance}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {groups.length === 0 ? t.noGroups : t.noStudents}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};