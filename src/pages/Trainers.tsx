import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../locales/translations';
import { db } from '../lib/firebase';
import { ref, push, update, remove, onValue, off } from 'firebase/database';
import { Plus, Pencil, Trash2, GraduationCap, Users } from 'lucide-react';
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

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  groups: { [key: string]: boolean };
  createdAt: number;
}

export const Trainers: React.FC = () => {
  const { settings } = useSettings();
  const { user, clubData } = useAuth();
  const t = translations[settings.language].trainers;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [isAddingTrainer, setIsAddingTrainer] = useState(false);
  const [editingTrainerId, setEditingTrainerId] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: ''
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
      } else {
        setGroups([]);
      }
    });

    return () => off(groupsRef);
  }, [user, clubData, selectedBranch]);

  useEffect(() => {
    if (!user || !clubData) return;

    const trainersRef = ref(db, `clubs/${user.uid}/trainers`);
    
    onValue(trainersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const trainerList = Object.entries(data).map(([id, trainer]) => ({
          id,
          ...(trainer as any),
        })).sort((a, b) => b.createdAt - a.createdAt);
        setTrainers(trainerList);
      } else {
        setTrainers([]);
      }
    });

    return () => off(trainersRef);
  }, [user, clubData]);

  const handleAddTrainer = async () => {
    if (!user || !clubData) return;

    try {
      const trainersRef = ref(db, `clubs/${user.uid}/trainers`);
      const groupAssignments = selectedGroups.reduce((acc, groupId) => ({
        ...acc,
        [groupId]: true
      }), {});

      await push(trainersRef, {
        ...formData,
        groups: groupAssignments,
        createdAt: Date.now(),
      });

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialization: ''
      });
      setSelectedGroups([]);
      setIsAddingTrainer(false);
      toast.success(t.success.add);
    } catch (error) {
      toast.error(t.error.add);
    }
  };

  const handleUpdateTrainer = async (trainerId: string) => {
    if (!user || !clubData) return;

    try {
      const trainerRef = ref(db, `clubs/${user.uid}/trainers/${trainerId}`);
      const groupAssignments = selectedGroups.reduce((acc, groupId) => ({
        ...acc,
        [groupId]: true
      }), {});

      await update(trainerRef, {
        ...formData,
        groups: groupAssignments,
      });

      setEditingTrainerId(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialization: ''
      });
      setSelectedGroups([]);
      toast.success(t.success.update);
    } catch (error) {
      toast.error(t.error.update);
    }
  };

  const handleDeleteTrainer = async (trainerId: string) => {
    if (!user || !clubData || !window.confirm(t.confirmDelete)) return;

    try {
      const trainerRef = ref(db, `clubs/${user.uid}/trainers/${trainerId}`);
      await remove(trainerRef);
      toast.success(t.success.delete);
    } catch (error) {
      toast.error(t.error.delete);
    }
  };

  const startEditing = (trainer: Trainer) => {
    setEditingTrainerId(trainer.id);
    setFormData({
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      email: trainer.email,
      phone: trainer.phone,
      specialization: trainer.specialization
    });
    setSelectedGroups(Object.keys(trainer.groups || {}));
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
      <div className="grid grid-cols-2 gap-4">
        <input
          type="email"
          placeholder={t.email}
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <input
          type="tel"
          placeholder={t.phone}
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      <input
        type="text"
        placeholder={t.specialization}
        value={formData.specialization}
        onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.assignGroups}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {groups.map((group) => (
            <label key={group.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedGroups.includes(group.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedGroups(prev => [...prev, group.id]);
                  } else {
                    setSelectedGroups(prev => prev.filter(id => id !== group.id));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{group.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            setIsAddingTrainer(false);
            setEditingTrainerId(null);
            setFormData({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              specialization: ''
            });
            setSelectedGroups([]);
          }}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {t.cancel}
        </button>
        <button
          onClick={onSubmit}
          disabled={!formData.firstName.trim() || !formData.lastName.trim() || selectedGroups.length === 0}
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

          {groups.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t.noGroups}
              </p>
            </div>
          ) : (
            <>
              {!isAddingTrainer && (
                <button
                  onClick={() => setIsAddingTrainer(true)}
                  className="mb-6 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t.addTrainer}
                </button>
              )}

              <div className="grid gap-6">
                {isAddingTrainer && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    {renderForm(handleAddTrainer, t.addTrainer)}
                  </div>
                )}

                {trainers.map((trainer) => (
                  <div
                    key={trainer.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
                  >
                    {editingTrainerId === trainer.id ? (
                      renderForm(() => handleUpdateTrainer(trainer.id), t.update)
                    ) : (
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {trainer.firstName} {trainer.lastName}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <span className="font-medium">{t.email}:</span> {trainer.email}
                            </div>
                            <div>
                              <span className="font-medium">{t.phone}:</span> {trainer.phone}
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">{t.specialization}:</span>{' '}
                              {trainer.specialization}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-sm">{t.assignedGroups}:</span>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {groups
                                .filter(group => trainer.groups?.[group.id])
                                .map(group => (
                                  <span
                                    key={group.id}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                                  >
                                    {group.name}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(trainer)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTrainer(trainer.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {trainers.length === 0 && !isAddingTrainer && (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <GraduationCap className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {t.noTrainers}
                    </p>
                    <button
                      onClick={() => setIsAddingTrainer(true)}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      {t.addFirstTrainer}
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