import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

interface ToolbarProps {
  onOpenSettings: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenSettings }) => {
  const { logout, clubData } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-sm z-50">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center">
          {clubData?.logoUrl && (
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
              <img
                src={clubData.logoUrl + '?t=' + Date.now()}
                alt={clubData.clubName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = clubData.logoUrl + '?t=' + Date.now();
                }}
              />
            </div>
          )}
          <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
            {clubData?.clubName}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenSettings}
            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};