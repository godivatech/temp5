
import React, { useState } from 'react';
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

  const handleMarkAttendance = async () => {
    try {
      setIsMarkingAttendance(true);
      await markAttendance();
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
    <header className="bg-white border-b border-gray-200 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAttendance}
            disabled={isMarkingAttendance}
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{isMarkingAttendance ? 'Processing...' : 'Mark Attendance'}</span>
            <span className="sm:hidden">{isMarkingAttendance ? 'Loading' : 'Attendance'}</span>
          </Button>
          
          {actions}
        </div>
      </div>
    </header>
  );
};
