
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Header: React.FC = () => {
  const { pathname } = useLocation();
  
  // Extract page title from route
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.includes('/customers')) return 'Customers';
    if (pathname.includes('/products')) return 'Products';
    if (pathname.includes('/quotations')) return 'Quotations';
    if (pathname.includes('/invoices')) return 'Invoices';
    if (pathname.includes('/users')) return 'User Management';
    if (pathname.includes('/attendance')) return 'Attendance';
    return 'Dashboard';
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm px-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        {getPageTitle()}
      </h1>
      
      <div className="flex items-center gap-3">
        <div className="relative w-64 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search..." 
            className="pl-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-medium text-white">
            3
          </span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
