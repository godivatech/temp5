
import React, { useState, useEffect } from 'react';
import { getAllUsersAttendance, getUserAttendance, AttendanceRecord } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Column } from '@/components/ui/data-table-types';
import { toast } from 'sonner';
import { Search, Calendar, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DateRange } from 'react-day-picker';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const { userData, hasRole } = useAuth();
  const isAdmin = hasRole(['master_admin', 'admin']);

  useEffect(() => {
    fetchAttendance();
  }, [isAdmin]);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      let data;
      
      if (isAdmin) {
        data = await getAllUsersAttendance();
      } else {
        data = await getUserAttendance();
      }
      
      setAttendanceRecords(data);
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      toast.error(error.message || 'Failed to fetch attendance records');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAttendanceStats = () => {
    const userStats = new Map();
    
    attendanceRecords.forEach(record => {
      if (!userStats.has(record.userId)) {
        userStats.set(record.userId, {
          userId: record.userId,
          userName: record.userName,
          totalDays: 0,
          presentDays: 0,
          percentage: 0
        });
      }
      
      const stats = userStats.get(record.userId);
      stats.totalDays++;
      
      if (record.status === 'present') {
        stats.presentDays++;
      } else if (record.status === 'half-day') {
        stats.presentDays += 0.5;
      }
      
      stats.percentage = (stats.presentDays / stats.totalDays) * 100;
      userStats.set(record.userId, stats);
    });
    
    return Array.from(userStats.values());
  };

  const exportToCSV = () => {
    try {
      const filteredRecords = filterAttendanceByDate();
      const headers = ['Date', 'Name', 'Time In', 'Time Out', 'Status'];
      
      const rows = filteredRecords.map(record => [
        record.date,
        record.userName,
        record.timeIn,
        record.timeOut || '-',
        record.status
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Attendance data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export attendance data');
    }
  };

  const filterAttendanceByDate = () => {
    if (!date || !date.from) return attendanceRecords;
    
    return attendanceRecords.filter(record => {
      const recordDate = parseISO(record.date);
      return isWithinInterval(recordDate, {
        start: date.from!,
        end: date.to || date.from!
      });
    });
  };

  const filteredRecords = filterAttendanceByDate().filter(record =>
    record.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'userName',
      title: 'Employee Name',
      accessorKey: 'userName'
    },
    {
      key: 'date',
      title: 'Date',
      accessorKey: 'date'
    },
    {
      key: 'timeIn',
      title: 'Time In',
      accessorKey: 'timeIn'
    },
    {
      key: 'timeOut',
      title: 'Time Out',
      accessorKey: 'timeOut',
      cell: ({ row }: { row: any }) => (
        <span>{row.original.timeOut || '-'}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      accessorKey: 'status',
      cell: ({ row }: { row: any }) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.original.status === 'present' ? 'bg-green-100 text-green-800' :
          row.original.status === 'absent' ? 'bg-red-100 text-red-800' :
          row.original.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </span>
      )
    }
  ];

  const statsColumns: Column<any>[] = [
    {
      key: 'userName',
      title: 'Employee Name',
      accessorKey: 'userName'
    },
    {
      key: 'totalDays',
      title: 'Total Days',
      accessorKey: 'totalDays'
    },
    {
      key: 'presentDays',
      title: 'Present Days',
      accessorKey: 'presentDays',
      cell: ({ row }: { row: any }) => (
        <span>{row.original.presentDays.toFixed(1)}</span>
      )
    },
    {
      key: 'percentage',
      title: 'Attendance %',
      accessorKey: 'percentage',
      cell: ({ row }: { row: any }) => (
        <span className={`font-medium ${
          row.original.percentage >= 90 ? 'text-green-500' : 
          row.original.percentage >= 75 ? 'text-yellow-500' : 'text-red-500'
        }`}>
          {row.original.percentage.toFixed(2)}%
        </span>
      )
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Attendance Management</h1>
              <div className="flex space-x-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                
                <div className="relative w-64">
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                
                {isAdmin && (
                  <Button onClick={exportToCSV} className="ml-2">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                )}
              </div>
            </div>

            {isAdmin && (
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle>Attendance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={statsColumns}
                    data={calculateAttendanceStats()}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Attendance Records</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={filteredRecords}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Attendance;
