
import React, { useState, useEffect } from 'react';
import { Bell, Search, PlusCircle, Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { markAttendance } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle,
  actions 
}) => {
  const { userData } = useAuth();
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [buttonText, setButtonText] = useState('Mark Attendance');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Check if the user is master admin
  const isMasterAdmin = userData?.role === 'master_admin';
  
  // Get attendance settings from localStorage or use defaults
  const getAttendanceSettings = () => {
    const savedSettings = localStorage.getItem('attendanceSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      enableTime: '08:00', // 8:00 AM IST
      disableTime: '10:00', // 10:00 AM IST
      isEnabled: true,
      lastMarkedDate: null
    };
  };
  
  const [attendanceSettings, setAttendanceSettings] = useState(getAttendanceSettings);
  
  // Update localStorage when settings change
  useEffect(() => {
    localStorage.setItem('attendanceSettings', JSON.stringify(attendanceSettings));
  }, [attendanceSettings]);
  
  // Timer to update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // Check if attendance button should be enabled based on time and previous attendance
  useEffect(() => {
    const checkAttendanceEligibility = () => {
      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      
      // Check if attendance was already marked today
      if (attendanceSettings.lastMarkedDate === today) {
        setButtonText('Attendance Marked');
        setIsButtonDisabled(true);
        return;
      }
      
      // If master admin has disabled the feature
      if (isMasterAdmin === false && attendanceSettings.isEnabled === false) {
        setButtonText('Attendance Disabled');
        setIsButtonDisabled(true);
        return;
      }
      
      // Check if current time is within allowed range
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      
      const [enableHour, enableMinute] = attendanceSettings.enableTime.split(':').map(Number);
      const [disableHour, disableMinute] = attendanceSettings.disableTime.split(':').map(Number);
      
      const isAfterEnableTime = 
        currentHour > enableHour || (currentHour === enableHour && currentMinute >= enableMinute);
      
      const isBeforeDisableTime = 
        currentHour < disableHour || (currentHour === disableHour && currentMinute < disableMinute);
      
      if (isAfterEnableTime && isBeforeDisableTime) {
        setButtonText('Mark Attendance');
        setIsButtonDisabled(false);
      } else if (!isAfterEnableTime) {
        setButtonText('Available at ' + attendanceSettings.enableTime);
        setIsButtonDisabled(true);
      } else {
        setButtonText('Attendance Closed');
        setIsButtonDisabled(true);
      }
    };
    
    checkAttendanceEligibility();
  }, [currentTime, attendanceSettings, isMasterAdmin]);
  
  const handleMarkAttendance = async () => {
    try {
      setIsMarkingAttendance(true);
      await markAttendance();
      
      // Update settings to mark attendance as done for today
      const today = format(new Date(), 'yyyy-MM-dd');
      setAttendanceSettings(prev => ({
        ...prev,
        lastMarkedDate: today
      }));
      
      toast.success('Attendance marked successfully');
    } catch (error: any) {
      console.error("Error marking attendance:", error);
      
      // Handle the specific error case for the indexOn rule
      if (error.message && error.message.includes("Index not defined, add \".indexOn\": \"userId\"")) {
        toast.error('Firebase database index not configured properly. Please try again later.');
      } else {
        toast.error(error.message || 'Failed to mark attendance');
      }
    } finally {
      setIsMarkingAttendance(false);
    }
  };
  
  // For master admin to update attendance settings
  const handleToggleAttendanceSystem = () => {
    if (isMasterAdmin) {
      setAttendanceSettings(prev => ({
        ...prev,
        isEnabled: !prev.isEnabled
      }));
      toast.success(`Attendance system ${!attendanceSettings.isEnabled ? 'enabled' : 'disabled'}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {!isMasterAdmin && (
            <Button
              variant={isButtonDisabled ? "outline" : "default"}
              size="sm"
              onClick={handleMarkAttendance}
              disabled={isButtonDisabled || isMarkingAttendance}
              className="flex items-center gap-1 text-xs sm:text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">{isMarkingAttendance ? 'Processing...' : buttonText}</span>
              <span className="sm:hidden">{isMarkingAttendance ? 'Loading' : buttonText.split(' ')[0]}</span>
            </Button>
          )}
          
          {isMasterAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleAttendanceSystem}
              className="flex items-center gap-1 text-xs sm:text-sm"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{attendanceSettings.isEnabled ? 'Disable Attendance' : 'Enable Attendance'}</span>
              <span className="sm:hidden">{attendanceSettings.isEnabled ? 'Disable' : 'Enable'}</span>
            </Button>
          )}
          
          {actions}
        </div>
      </div>
    </header>
  );
};
