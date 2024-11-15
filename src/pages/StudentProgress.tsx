import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../locales/translations';
import { db } from '../lib/firebase';
import { ref, push, update, onValue, off } from 'firebase/database';
import {
  LineChart as LineChartIcon,
  Users,
  Ruler,
  Weight,
  Brain,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Branch {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface ProgressRecord {
  id: string;
  date: string;
  height: number;
  weight: number;
  verticalJump: number;
  speedTest: number;
  academicScore: number;
  notes: string;
  createdAt: number;
}

export const StudentProgress: React.FC = () => {
  const { settings } = useSettings();
  const { user, clubData } = useAuth();
  const t = translations[settings.language].studentProgress;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<ProgressRecord | null>(null);
  const [isAddingRecord, setIsAddingRecord] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    height: '',
    weight: '',
    verticalJump: '',
    speedTest: '',
    academicScore: '',
    notes: ''
  });

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
          name: (group as any).name,
        }));
        setGroups(groupList);
        
        if (!selectedGroup && groupList.length > 0) {
          setSelectedGroup(groupList[0].id);
        }
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
      }
    });

    return () => off(studentsRef);
  }, [user, clubData, selectedGroup]);

  useEffect(() => {
    if (!user || !clubData || !selectedStudent) return;

    const progressRef = ref(db, `clubs/${user.uid}/progress/${selectedStudent}`);
    
    onValue(progressRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const recordList = Object.entries(data).map(([id, record]) => ({
          id,
          ...(record as any),
        })).sort((a, b) => b.createdAt - a.createdAt);
        setProgressRecords(recordList);
      } else {
        setProgressRecords([]);
      }
    });

    return () => off(progressRef);
  }, [user, clubData, selectedStudent]);

  const handleAddRecord = async () => {
    if (!user || !clubData || !selectedStudent) return;

    try {
      const progressRef = ref(db, `clubs/${user.uid}/progress/${selectedStudent}`);
      await push(progressRef, {
        ...formData,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        verticalJump: parseFloat(formData.verticalJump),
        speedTest: parseFloat(formData.speedTest),
        academicScore: parseInt(formData.academicScore),
        createdAt: Date.now(),
      });

      setFormData({
        date: new Date().toISOString().split('T')[0],
        height: '',
        weight: '',
        verticalJump: '',
        speedTest: '',
        academicScore: '',
        notes: ''
      });
      setIsAddingRecord(false);
      toast.success(t.success.add);
    } catch (error) {
      toast.error(t.error.add);
    }
  };

  const handleUpdateRecord = async (recordId: string) => {
    if (!user || !clubData || !selectedStudent) return;

    try {
      const recordRef = ref(db, `clubs/${user.uid}/progress/${selectedStudent}/${recordId}`);
      await update(recordRef, {
        ...formData,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        verticalJump: parseFloat(formData.verticalJump),
        speedTest: parseFloat(formData.speedTest),
        academicScore: parseInt(formData.academicScore),
      });

      setSelectedRecord(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        height: '',
        weight: '',
        verticalJump: '',
        speedTest: '',
        academicScore: '',
        notes: ''
      });
      toast.success(t.success.update);
    } catch (error) {
      toast.error(t.error.update);
    }
  };

  const startEditing = (record: ProgressRecord) => {
    setSelectedRecord(record);
    setFormData({
      date: record.date,
      height: record.height.toString(),
      weight: record.weight.toString(),
      verticalJump: record.verticalJump.toString(),
      speedTest: record.speedTest.toString(),
      academicScore: record.academicScore.toString(),
      notes: record.notes
    });
  };

  const renderForm = (onSubmit: () => void, submitLabel: string) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {t.height} (cm)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.height}
            onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.weight} (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.verticalJump} (cm)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.verticalJump}
            onChange={(e) => setFormData(prev => ({ ...prev, verticalJump: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.speedTest} (sec)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.speedTest}
            onChange={(e) => setFormData(prev => ({ ...prev, speedTest: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.academicScore} (0-100)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.academicScore}
            onChange={(e) => setFormData(prev => ({ ...prev, academicScore: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t.notes}
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            setIsAddingRecord(false);
            setSelectedRecord(null);
            setFormData({
              date: new Date().toISOString().split('T')[0],
              height: '',
              weight: '',
              verticalJump: '',
              speedTest: '',
              academicScore: '',
              notes: ''
            });
          }}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {t.cancel}
        </button>
        <button
          onClick={onSubmit}
          disabled={!formData.height || !formData.weight}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );

  const renderProgressChart = () => {
    if (progressRecords.length < 2) return null;

    const sortedRecords = [...progressRecords].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const metrics = [
      { key: 'height', label: t.height, color: 'blue' },
      { key: 'weight', label: t.weight, color: 'green' },
      { key: 'verticalJump', label: t.verticalJump, color: 'purple' },
      { key: 'speedTest', label: t.speedTest, color: 'orange' },
      { key: 'academicScore', label: t.academicScore, color: 'red' }
    ];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t.progressChart}
        </h3>
        <div className="space-y-6">
          {metrics.map(metric => (
            <div key={metric.key} className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {metric.label}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {sortedRecords[sortedRecords.length - 1][metric.key as keyof ProgressRecord]}
                  {metric.key === 'height' ? ' cm' : metric.key === 'weight' ? ' kg' : ''}
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${metric.color}-600 rounded-full transition-all duration-500`}
                  style={{
                    width: '100%',
                    transform: `scaleX(${
                      (sortedRecords[sortedRecords.length - 1][metric.key as keyof ProgressRecord] as number) /
                      Math.max(...sortedRecords.map(r => r[metric.key as keyof ProgressRecord] as number))
                    })`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>

            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={groups.length === 0}
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={students.length === 0}
            >
              <option value="">{t.selectStudent}</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </div>

          {selectedStudent ? (
            <>
              {!isAddingRecord && !selectedRecord && (
                <button
                  onClick={() => setIsAddingRecord(true)}
                  className="mb-6 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {t.addRecord}
                </button>
              )}

              <div className="grid gap-6">
                {(isAddingRecord || selectedRecord) && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    {renderForm(
                      selectedRecord
                        ? () => handleUpdateRecord(selectedRecord.id)
                        : handleAddRecord,
                      selectedRecord ? t.update : t.addRecord
                    )}
                  </div>
                )}

                {renderProgressChart()}

                {progressRecords.map((record) => (
                  <div
                    key={record.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <div className="flex items-center mb-4">
                          <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {new Date(record.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="flex items-center">
                            <Ruler className="w-5 h-5 text-blue-500 mr-2" />
                            <div>
                              <span className="text-sm text-gray-500 dark:text-gray-400 block">
                                {t.height}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {record.height} cm
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Weight className="w-5 h-5 text-green-500 mr-2" />
                            <div>
                              <span className="text-sm text-gray-500 dark:text-gray-400 block">
                                {t.weight}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {record.weight} kg
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="w-5 h-5 text-purple-500 mr-2" />
                            <div>
                              <span className="text-sm text-gray-500 dark:text-gray-400 block">
                                {t.verticalJump}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {record.verticalJump} cm
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <LineChartIcon className="w-5 h-5 text-orange-500 mr-2" />
                            <div>
                              <span className="text-sm text-gray-500 dark:text-gray-400 block">
                                {t.speedTest}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {record.speedTest} sec
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Brain className="w-5 h-5 text-red-500 mr-2" />
                            <div>
                              <span className="text-sm text-gray-500 dark:text-gray-400 block">
                                {t.academicScore}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {record.academicScore}/100
                              </span>
                            </div>
                          </div>
                        </div>
                        {record.notes && (
                          <div className="mt-4 text-gray-600 dark:text-gray-400">
                            {record.notes}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => startEditing(record)}
                        className="ml-4 p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        {selectedRecord?.id === record.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {progressRecords.length === 0 && !isAddingRecord && (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <LineChartIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {t.noRecords}
                    </p>
                    <button
                      onClick={() => setIsAddingRecord(true)}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      {t.addFirstRecord}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {t.selectStudentPrompt}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};