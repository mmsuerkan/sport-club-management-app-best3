import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../locales/translations';
import { db } from '../lib/firebase';
import { ref, push, update, remove, onValue, off } from 'firebase/database';
import { Plus, Pencil, Trash2, UserPlus, Users } from 'lucide-react';
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
  dateOfBirth: string;
  parentName: string;
  parentPhone: string;
  email: string;
  groupId: string;
  createdAt: number;
}

export const Students: React.FC = () => {
  const { settings } = useSettings();
  const { user, clubData } = useAuth();
  const t = translations[settings.language].students;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    parentName: '',
    parentPhone: '',
    email: ''
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
        })).sort((a, b) => b.createdAt - a.createdAt);
        setStudents(studentList);
      } else {
        setStudents([]);
      }
    });

    return () => off(studentsRef);
  }, [user, clubData, selectedGroup]);

  const handleAddStudent = async () => {
    if (!user || !clubData || !selectedGroup) return;

    try {
      const studentsRef = ref(db, `clubs/${user.uid}/students/${selectedGroup}`);
      await push(studentsRef, {
        ...formData,
        groupId: selectedGroup,
        createdAt: Date.now(),
      });

      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        parentName: '',
        parentPhone: '',
        email: ''
      });
      setIsAddingStudent(false);
      toast.success(t.success.add);
    } catch (error) {
      toast.error(t.error.add);
    }
  };

  const handleUpdateStudent = async (studentId: string) => {
    if (!user || !clubData || !selectedGroup) return;

    try {
      const studentRef = ref(db, `clubs/${user.uid}/students/${selectedGroup}/${studentId}`);
      await update(studentRef, {
        ...formData,
      });

      setEditingStudentId(null);
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        parentName: '',
        parentPhone: '',
        email: ''
      });
      toast.success(t.success.update);
    } catch (error) {
      toast.error(t.error.update);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!user || !clubData || !selectedGroup || !window.confirm(t.confirmDelete)) return;

    try {
      const studentRef = ref(db, `clubs/${user.uid}/students/${selectedGroup}/${studentId}`);
      await remove(studentRef);
      toast.success(t.success.delete);
    } catch (error) {
      toast.error(t.error.delete);
    }
  };

  const startEditing = (student: Student) => {
    setEditingStudentId(student.id);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      email: student.email
    });
  };

  const renderForm = (onSubmit: () => void, submitLabel: string) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder={t.firstName}
          value={formData.firstName}
          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <input
          type="text"
          placeholder={t.lastName}
          value={formData.lastName}
          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      <input
        type="date"
        value={formData.dateOfBirth}
        onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder={t.parentName}
          value={formData.parentName}
          onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <input
          type="tel"
          placeholder={t.parentPhone}
          value={formData.parentPhone}
          onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      <input
        type="email"
        placeholder={t.email}
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            setIsAddingStudent(false);
            setEditingStudentId(null);
            setFormData({
              firstName: '',
              lastName: '',
              dateOfBirth: '',
              parentName: '',
              parentPhone: '',
              email: ''
            });
          }}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {t.cancel}
        </button>
        <button
          onClick={onSubmit}
          disabled={!formData.firstName.trim() || !formData.lastName.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );

  if (!clubData) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.title}
        </h1>
      </div>

      {branches.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t.noBranches}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex space-x-4">
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
            {groups.length > 0 && (
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t.noGroups}
              </p>
            </div>
          ) : (
            <>
              {!isAddingStudent && (
                <button
                  onClick={() => setIsAddingStudent(true)}
                  className="mb-6 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  {t.addStudent}
                </button>
              )}

              <div className="grid gap-6">
                {isAddingStudent && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    {renderForm(handleAddStudent, t.addStudent)}
                  </div>
                )}

                {students.map((student) => (
                  <div
                    key={student.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
                  >
                    {editingStudentId === student.id ? (
                      renderForm(() => handleUpdateStudent(student.id), t.update)
                    ) : (
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {student.firstName} {student.lastName}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">{t.dateOfBirth}:</span>{' '}
                              {new Date(student.dateOfBirth).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">{t.email}:</span> {student.email}
                            </div>
                            <div>
                              <span className="font-medium">{t.parentName}:</span>{' '}
                              {student.parentName}
                            </div>
                            <div>
                              <span className="font-medium">{t.parentPhone}:</span>{' '}
                              {student.parentPhone}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(student)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {students.length === 0 && !isAddingStudent && (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <UserPlus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {t.noStudents}
                    </p>
                    <button
                      onClick={() => setIsAddingStudent(true)}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      {t.addFirstStudent}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};