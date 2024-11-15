import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../locales/translations';
import { db } from '../lib/firebase';
import { ref, push, update, remove, onValue, off } from 'firebase/database';
import { Plus, Pencil, Trash2, X, Check, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Branch {
  id: string;
  name: string;
  address: string;
  createdAt: number;
}

export const Branches: React.FC = () => {
  const { settings } = useSettings();
  const { user, clubData } = useAuth();
  const t = translations[settings.language].branches;
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');

  useEffect(() => {
    if (!user || !clubData) return;

    const branchesRef = ref(db, `clubs/${user.uid}/branches`);
    
    onValue(branchesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const branchList = Object.entries(data).map(([id, branch]) => ({
          id,
          ...(branch as any),
        })).sort((a, b) => b.createdAt - a.createdAt);
        setBranches(branchList);
      } else {
        setBranches([]);
      }
    });

    return () => {
      off(branchesRef);
    };
  }, [user, clubData]);

  const handleAddBranch = async () => {
    if (!user || !clubData || !newBranchName.trim() || !newBranchAddress.trim()) return;

    try {
      const branchesRef = ref(db, `clubs/${user.uid}/branches`);
      await push(branchesRef, {
        name: newBranchName.trim(),
        address: newBranchAddress.trim(),
        createdAt: Date.now(),
      });

      setNewBranchName('');
      setNewBranchAddress('');
      setIsAddingBranch(false);
      toast.success(t.success.add);
    } catch (error) {
      toast.error(t.error.add);
    }
  };

  const handleUpdateBranch = async (branchId: string) => {
    if (!user || !clubData || !newBranchName.trim() || !newBranchAddress.trim()) return;

    try {
      const branchRef = ref(db, `clubs/${user.uid}/branches/${branchId}`);
      await update(branchRef, {
        name: newBranchName.trim(),
        address: newBranchAddress.trim(),
      });

      setEditingBranchId(null);
      setNewBranchName('');
      setNewBranchAddress('');
      toast.success(t.success.update);
    } catch (error) {
      toast.error(t.error.update);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!user || !clubData || !window.confirm(t.confirmDelete)) return;

    try {
      const branchRef = ref(db, `clubs/${user.uid}/branches/${branchId}`);
      await remove(branchRef);
      toast.success(t.success.delete);
    } catch (error) {
      toast.error(t.error.delete);
    }
  };

  const startEditing = (branch: Branch) => {
    setEditingBranchId(branch.id);
    setNewBranchName(branch.name);
    setNewBranchAddress(branch.address);
  };

  if (!clubData) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.title}
        </h1>
        {!isAddingBranch && (
          <button
            onClick={() => setIsAddingBranch(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t.addBranch}
          </button>
        )}
      </div>

      <div className="grid gap-6">
        {isAddingBranch && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <input
                type="text"
                placeholder={t.branchName}
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder={t.branchAddress}
                value={newBranchAddress}
                onChange={(e) => setNewBranchAddress(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsAddingBranch(false);
                    setNewBranchName('');
                    setNewBranchAddress('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleAddBranch}
                  disabled={!newBranchName.trim() || !newBranchAddress.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {t.addBranch}
                </button>
              </div>
            </div>
          </div>
        )}

        {branches.map((branch) => (
          <div
            key={branch.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            {editingBranchId === branch.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setEditingBranchId(null);
                      setNewBranchName('');
                      setNewBranchAddress('');
                    }}
                    className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleUpdateBranch(branch.id)}
                    disabled={!newBranchName.trim() || !newBranchAddress.trim()}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {branch.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{branch.address}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditing(branch)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBranch(branch.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {branches.length === 0 && !isAddingBranch && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t.noBranches}
            </p>
            <button
              onClick={() => setIsAddingBranch(true)}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              {t.addFirstBranch}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};