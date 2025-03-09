
import React, { useState, useEffect } from 'react';
import { Clock, PlusCircle, CheckCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { markAttendance } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<string>('');
  const isMasterAdmin = userData?.role === 'master_admin';

  useEffect(() => {
    const checkAttendanceStatus = () => {
      // Get the current date in IST (Indian Standard Time)
      const now = new Date();
      const istOffset = 330; // IST is UTC+5:30 (330 minutes)
      const istDate = new Date(now.getTime() + (istOffset * 60000));
      
      const today = istDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      // Check if attendance was already marked today
      const lastMarkedDate = localStorage.getItem('lastAttendanceDate');
      const wasMarkedToday = lastMarkedDate === today;
      
      if (wasMarkedToday) {
        setAttendanceMarked(true);
        setAttendanceStatus('Attendance marked for today');
        setIsButtonDisabled(true);
        return;
      }
      
      // Check if current time is between 8 AM and 10 AM IST
      const hours = istDate.getUTCHours();
      const minutes = istDate.getUTCMinutes();
      const totalMinutes = hours * 60 + minutes;
      
      const is8AM = totalMinutes >= 8 * 60; // 8:00 AM IST
      const is10AM = totalMinutes >= 10 * 60; // 10:00 AM IST
      
      // Master admin can mark attendance anytime
      if (isMasterAdmin) {
        setIsButtonDisabled(false);
        setAttendanceStatus('Admin can mark attendance anytime');
      } else if (!is8AM) {
        setIsButtonDisabled(true);
        setAttendanceStatus('Attendance starts at 8:00 AM IST');
      } else if (is10AM) {
        setIsButtonDisabled(true);
        setAttendanceStatus('Attendance closed at 10:00 AM IST');
      } else {
        setIsButtonDisabled(false);
        setAttendanceStatus('Mark your attendance before 10:00 AM IST');
      }
    };

    checkAttendanceStatus();
    
    // Check status every minute
    const interval = setInterval(checkAttendanceStatus, 60000);
    
    return () => clearInterval(interval);
  }, [isMasterAdmin]);

  const handleMarkAttendance = async () => {
    try {
      await markAttendance();
      
      // Store the date when attendance was marked
      const now = new Date();
      const istOffset = 330; // IST is UTC+5:30 (330 minutes)
      const istDate = new Date(now.getTime() + (istOffset * 60000));
      const today = istDate.toISOString().split('T')[0];
      
      localStorage.setItem('lastAttendanceDate', today);
      
      setAttendanceMarked(true);
      setIsButtonDisabled(true);
      setAttendanceStatus('Attendance marked successfully');
      
      toast.success('Attendance marked successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark attendance');
    }
  };

  // Admin attendance control panel
  const handleResetAttendance = () => {
    if (isMasterAdmin) {
      localStorage.removeItem('lastAttendanceDate');
      setAttendanceMarked(false);
      setIsButtonDisabled(false);
      toast.success('Attendance reset for all users');
    }
  };

  return (
    <header className="bg-white border-b border-indigo-100 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-green-500">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative group">
            <Button
              variant={attendanceMarked ? "outline" : "default"}
              size="sm"
              onClick={handleMarkAttendance}
              disabled={isButtonDisabled}
              className={`flex items-center gap-1 text-xs sm:text-sm transition-all duration-300 ${
                attendanceMarked 
                  ? "bg-green-50 text-green-700 hover:bg-green-100 border-green-200" 
                  : "bg-gradient-to-r from-indigo-500 to-green-500 hover:from-indigo-600 hover:to-green-600 text-white"
              }`}
            >
              {attendanceMarked ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {attendanceMarked ? "Attendance Marked" : "Mark Attendance"}
              </span>
              <span className="sm:hidden">Attendance</span>
            </Button>
            <div className="absolute z-50 hidden group-hover:block mt-2 bg-black bg-opacity-75 text-white text-xs rounded py-1 px-2 right-0 whitespace-nowrap">
              {attendanceStatus}
            </div>
          </div>
          
          {isMasterAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAttendance}
              className="flex items-center gap-1 text-xs"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">Admin Control</span>
            </Button>
          )}
          
          {actions}
        </div>
      </div>
    </header>
  );
};
