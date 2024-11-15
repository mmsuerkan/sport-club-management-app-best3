import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../locales/translations';
import { db } from '../lib/firebase';
import { ref, push, update, remove, onValue, off } from 'firebase/database';
import { Plus, Pencil, Trash2, Users, GraduationCap, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Branch {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  branchId: string;
  capacity: number;
  ageGroup: string;
  schedule: string;
  createdAt: number;
}

interface GroupStats {
  studentCount: number;
  trainerCount: number;
}

export const Groups: React.FC = () => {
  const { settings } = useSettings();
  const { user, clubData } = useAuth();
  const t = translations[settings.language].groups;
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupStats, setGroupStats] = useState<Record<string, GroupStats>>({});
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    ageGroup: '',
    schedule: ''
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
        })).sort((a, b) => b.createdAt - a.createdAt);
        setGroups(groupList);
        
        // Fetch stats for each group
        groupList.forEach(group => {
          fetchGroupStats(group.id);
        });
      } else {
        setGroups([]);
        setGroupStats({});
      }
    });

    return () => off(groupsRef);
  }, [user, clubData, selectedBranch]);

  const fetchGroupStats = async (groupId: string) => {
    if (!user || !clubData) return;

    // Fetch students count
    const studentsRef = ref(db, `clubs/${user.uid}/students/${groupId}`);
    const trainersRef = ref(db, `clubs/${user.uid}/trainers`);

    onValue(studentsRef, (snapshot) => {
      const studentCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      
      // Fetch trainers count
      onValue(trainersRef, (trainersSnapshot) => {
        let trainerCount = 0;
        if (trainersSnapshot.exists()) {
          Object.values(trainersSnapshot.val()).forEach((trainer: any) => {
            if (trainer.groups && trainer.groups[groupId]) {
              trainerCount++;
            }
          });
        }

        setGroupStats(prev => ({
          ...prev,
          [groupId]: { studentCount, trainerCount }
        }));
      });
    });
  };

  const handleAddGroup = async () => {
    if (!user || !clubData || !selectedBranch) return;

    try {
      const groupsRef = ref(db, `clubs/${user.uid}/branches/${selectedBranch}/groups`);
      await push(groupsRef, {
        ...formData,
        capacity: parseInt(formData.capacity),
        branchId: selectedBranch,
        createdAt: Date.now(),
      });

      setFormData({
        name: '',
        description: '',
        capacity: '',
        ageGroup: '',
        schedule: ''
      });
      setIsAddingGroup(false);
      toast.success(t.success.add);
    } catch (error) {
      toast.error(t.error.add);
    }
  };

  const handleUpdateGroup = async (groupId: string) => {
    if (!user || !clubData || !selectedBranch) return;

    try {
      const groupRef = ref(db, `clubs/${user.uid}/branches/${selectedBranch}/groups/${groupId}`);
      await update(groupRef, {
        ...formData,
        capacity: parseInt(formData.capacity),
      });

      setEditingGroupId(null);
      setFormData({
        name: '',
        description: '',
        capacity: '',
        ageGroup: '',
        schedule: ''
      });
      toast.success(t.success.update);
    } catch (error) {
      toast.error(t.error.update);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!user || !clubData || !selectedBranch || !window.confirm(t.confirmDelete)) return;

    try {
      const groupRef = ref(db, `clubs/${user.uid}/branches/${selectedBranch}/groups/${groupId}`);
      await remove(groupRef);
      toast.success(t.success.delete);
    } catch (error) {
      toast.error(t.error.delete);
    }
  };

  const startEditing = (group: Group) => {
    setEditingGroupId(group.id);
    setFormData({
      name: group.name,
      description: group.description,
      capacity: group.capacity.toString(),
      ageGroup: group.ageGroup,
      schedule: group.schedule
    });
  };

  const renderForm = (onSubmit: () => void, submitLabel: string) => (
    <div className="space-y-4">
      <input
        type="text"
        placeholder={t.groupName}
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
      <textarea
        placeholder={t.description}
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        rows={3}
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder={t.capacity}
          value={formData.capacity}
          onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <input
          type="text"
          placeholder={t.ageGroupPlaceholder}
          value={formData.ageGroup}
          onChange={(e) => setFormData(prev => ({ ...prev, ageGroup: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      <input
        type="text"
        placeholder={t.schedulePlaceholder}
        value={formData.schedule}
        onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            setIsAddingGroup(false);
            setEditingGroupId(null);
            setFormData({
              name: '',
              description: '',
              capacity: '',
              ageGroup: '',
              schedule: ''
            });
          }}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {t.cancel}
        </button>
        <button
          onClick={onSubmit}
          disabled={!formData.name.trim() || !formData.capacity || !formData.ageGroup.trim()}
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
          <div className="mb-6">
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
          </div>

          {!isAddingGroup && (
            <button
              onClick={() => setIsAddingGroup(true)}
              className="mb-6 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t.addGroup}
            </button>
          )}

          <div className="grid gap-6">
            {isAddingGroup && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                {renderForm(handleAddGroup, t.addGroup)}
              </div>
            )}

            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
              >
                {editingGroupId === group.id ? (
                  renderForm(() => handleUpdateGroup(group.id), t.update)
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {group.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{group.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="font-medium">{t.capacity}:</span> {group.capacity}
                        </div>
                        <div>
                          <span className="font-medium">{t.ageGroup}:</span> {group.ageGroup}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">{t.schedule}:</span> {group.schedule}
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg px-3 py-2">
                          <UserPlus className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {groupStats[group.id]?.studentCount || 0} {t.students}
                          </span>
                        </div>
                        <div className="flex items-center bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg px-3 py-2">
                          <GraduationCap className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {groupStats[group.id]?.trainerCount || 0} {t.trainers}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditing(group)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {groups.length === 0 && !isAddingGroup && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {t.noGroups}
                </p>
                <button
                  onClick={() => setIsAddingGroup(true)}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  {t.addFirstGroup}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};