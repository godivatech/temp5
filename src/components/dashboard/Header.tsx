
import React from 'react';
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

  const handleMarkAttendance = async () => {
    try {
      await markAttendance();
      toast.success('Attendance marked successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark attendance');
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
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Mark Attendance</span>
            <span className="sm:hidden">Attendance</span>
          </Button>
          
          {actions}
        </div>
      </div>
    </header>
  );
};
