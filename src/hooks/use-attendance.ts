
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

// Interface for attendance settings
export interface AttendanceSettings {
  enableTime: string;
  disableTime: string;
  isEnabled: boolean;
  lastMarkedDate: string | null;
}

// Default settings
const defaultSettings: AttendanceSettings = {
  enableTime: '08:00', // 8:00 AM IST
  disableTime: '10:00', // 10:00 AM IST
  isEnabled: true,
  lastMarkedDate: null
};

export const useAttendance = (isMasterAdmin: boolean = false) => {
  // Get stored settings or use defaults
  const getStoredSettings = (): AttendanceSettings => {
    const storedSettings = localStorage.getItem('attendanceSettings');
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
    return defaultSettings;
  };

  const [settings, setSettings] = useState<AttendanceSettings>(getStoredSettings);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [buttonText, setButtonText] = useState('Mark Attendance');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('attendanceSettings', JSON.stringify(settings));
  }, [settings]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Check if attendance button should be enabled
  useEffect(() => {
    const checkAttendanceEligibility = () => {
      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      
      // Check if attendance was already marked today
      if (settings.lastMarkedDate === today) {
        setButtonText('Attendance Marked');
        setButtonDisabled(true);
        return;
      }
      
      // If master admin has disabled the feature
      if (!isMasterAdmin && !settings.isEnabled) {
        setButtonText('Attendance Disabled');
        setButtonDisabled(true);
        return;
      }
      
      // Check if current time is within allowed range
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const [enableHour, enableMinute] = settings.enableTime.split(':').map(Number);
      const [disableHour, disableMinute] = settings.disableTime.split(':').map(Number);
      
      const isAfterEnableTime = 
        currentHour > enableHour || (currentHour === enableHour && currentMinute >= enableMinute);
      
      const isBeforeDisableTime = 
        currentHour < disableHour || (currentHour === disableHour && currentMinute < disableMinute);
      
      if (isAfterEnableTime && isBeforeDisableTime) {
        setButtonText('Mark Attendance');
        setButtonDisabled(false);
      } else if (!isAfterEnableTime) {
        setButtonText(`Available at ${settings.enableTime}`);
        setButtonDisabled(true);
      } else {
        setButtonText('Attendance Closed');
        setButtonDisabled(true);
      }
    };
    
    checkAttendanceEligibility();
  }, [currentTime, settings, isMasterAdmin]);

  // Mark attendance for today
  const markAttendanceComplete = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setSettings(prev => ({
      ...prev,
      lastMarkedDate: today
    }));
  };

  // Toggle attendance system (for master admin)
  const toggleAttendanceSystem = () => {
    if (isMasterAdmin) {
      setSettings(prev => ({
        ...prev,
        isEnabled: !prev.isEnabled
      }));
      return !settings.isEnabled;
    }
    return settings.isEnabled;
  };

  // Update time settings (for master admin)
  const updateAttendanceTimeSettings = (enableTime: string, disableTime: string) => {
    if (isMasterAdmin) {
      setSettings(prev => ({
        ...prev,
        enableTime,
        disableTime
      }));
      return true;
    }
    return false;
  };

  // Reset attendance for a new day (mainly for testing)
  const resetAttendance = () => {
    if (isMasterAdmin) {
      setSettings(prev => ({
        ...prev,
        lastMarkedDate: null
      }));
      return true;
    }
    return false;
  };

  return {
    buttonDisabled,
    buttonText,
    currentTime,
    settings,
    markAttendanceComplete,
    toggleAttendanceSystem,
    updateAttendanceTimeSettings,
    resetAttendance
  };
};
