import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthForm } from './AuthForm';
import { Dashboard } from './Dashboard';
import { Onboarding } from './Onboarding';
import { Sidebar } from './Sidebar';
import { Toolbar } from './Toolbar';
import { Footer } from './Footer';
import { SettingsModal } from './SettingsModal';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

// Page components
import { Branches } from '../pages/Branches';
import { Groups } from '../pages/Groups';
import { Students } from '../pages/Students';
import { Trainers } from '../pages/Trainers';
import { Attendance } from '../pages/Attendance';
import { AttendanceRecords } from '../pages/AttendanceRecords';
import { StudentProgress } from '../pages/StudentProgress';
import { MatchSchedule } from '../pages/MatchSchedule';
import { Payments } from '../pages/Payments';
import { Finance } from '../pages/Finance';

export const AppContent: React.FC = () => {
  const { user, clubData } = useAuth();
  const { settings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  if (!user) return <AuthForm />;
  if (!clubData) return <Onboarding />;

  return (
    <div className={settings.theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <Toolbar onOpenSettings={() => setIsSettingsOpen(true)} />
        <Sidebar
          isExpanded={isSidebarExpanded}
          onExpandedChange={setIsSidebarExpanded}
        />
        <div
          className={`pt-16 flex-grow transition-all duration-300 ${
            isSidebarExpanded ? 'pl-64' : 'pl-16'
          }`}
        >
          <div className="p-8">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/branches" element={<Branches />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/students" element={<Students />} />
              <Route path="/trainers" element={<Trainers />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/attendance-records" element={<AttendanceRecords />} />
              <Route path="/student-progress" element={<StudentProgress />} />
              <Route path="/match-schedule" element={<MatchSchedule />} />
              <Route path="/payments/*" element={<Payments />} />
              <Route path="/finance/*" element={<Finance />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>
    </div>
  );
};