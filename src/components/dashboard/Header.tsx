
import React, { useState, useEffect } from 'react';
import { Bell, Search, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    checkAttendanceButtonStatus();
    // Check every minute for time-based restrictions
    const interval = setInterval(checkAttendanceButtonStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkAttendanceButtonStatus = () => {
    // Get current time in Indian Standard Time (UTC+5:30)
    const now = new Date();
    const istOptions = { timeZone: 'Asia/Kolkata' };
    const istTime = new Date(now.toLocaleString('en-US', istOptions));
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    
    // Check if current time is between 8:00 AM and 10:00 AM IST
    const isTimeAllowed = (hours > 8 || (hours === 8 && minutes >= 0)) && 
                          (hours < 10 || (hours === 10 && minutes === 0));
    
    // Check if user has already marked attendance today from localStorage
    const today = new Date().toISOString().split('T')[0];
    const lastAttendanceDate = localStorage.getItem('lastAttendanceDate');
    const hasMarkedToday = lastAttendanceDate === today;
    
    setIsButtonDisabled(!isTimeAllowed || hasMarkedToday);
  };

  const handleMarkAttendance = async () => {
    try {
      setIsMarkingAttendance(true);
      await markAttendance();
      
      // Store today's date in localStorage to track attendance
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('lastAttendanceDate', today);
      
      // Update button state
      setIsButtonDisabled(true);
      
      toast.success('Attendance marked successfully');
    } catch (error: any) {
      console.error("Error marking attendance:", error);
      // Handle the specific error case for the indexOn rule
      if (error.message && error.message.includes("Index not defined, add \".indexOn\": \"userId\"")) {
        toast.error('Firebase database index not configured. Please contact administrator.');
      } else {
        toast.error(error.message || 'Failed to mark attendance');
      }
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  return (
    <header className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-green-800">{title}</h1>
          {subtitle && <p className="text-sm text-green-600 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAttendance}
            disabled={isMarkingAttendance || isButtonDisabled}
            className={`flex items-center gap-1 text-xs sm:text-sm ${
              isButtonDisabled 
                ? 'bg-gray-100 text-gray-500' 
                : 'bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800'
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isMarkingAttendance 
                ? 'Processing...' 
                : isButtonDisabled 
                  ? 'Attendance Marked' 
                  : 'Mark Attendance'}
            </span>
            <span className="sm:hidden">
              {isMarkingAttendance 
                ? 'Loading' 
                : isButtonDisabled 
                  ? 'Marked' 
                  : 'Attendance'}
            </span>
          </Button>
          
          {actions}
        </div>
      </div>
    </header>
  );
};
