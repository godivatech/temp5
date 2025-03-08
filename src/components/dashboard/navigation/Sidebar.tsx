
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  Package,
  FileText,
  FileInput,
  UserCog,
  Clock,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import SidebarMobile from './SidebarMobile';
import NavItem from './NavItem';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { logout, userData, hasRole } = useAuth();
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const mainNavItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      roles: ['master_admin', 'admin', 'employee'],
    },
    {
      title: 'Customers',
      icon: Users,
      path: '/dashboard/customers',
      roles: ['master_admin', 'admin', 'employee'],
    },
    {
      title: 'Products',
      icon: Package,
      path: '/dashboard/products',
      roles: ['master_admin', 'admin', 'employee'],
    },
    {
      title: 'Quotations',
      icon: FileText,
      path: '/dashboard/quotations',
      roles: ['master_admin', 'admin', 'employee'],
    },
    {
      title: 'Invoices',
      icon: FileInput,
      path: '/dashboard/invoices',
      roles: ['master_admin', 'admin'],
    },
  ];

  const adminNavItems = [
    {
      title: 'User Management',
      icon: UserCog,
      path: '/dashboard/users',
      roles: ['master_admin'],
    },
    {
      title: 'Attendance',
      icon: Clock,
      path: '/dashboard/attendance',
      roles: ['master_admin', 'admin'],
    },
  ];

  if (isMobile) {
    return <SidebarMobile 
      mainNavItems={mainNavItems} 
      adminNavItems={adminNavItems} 
      handleLogout={handleLogout} 
    />;
  }

  return (
    <aside
      className={cn(
        'h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out sticky top-0 left-0 z-30 shadow-sm',
        isExpanded ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {isExpanded ? (
            <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Prakash Green</h2>
          ) : (
            <div className="flex w-full justify-center">
              <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <span className="text-lg font-bold">P</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto py-4 px-3">
          <nav className="flex flex-col gap-1.5">
            {mainNavItems.map(item => (
              hasRole(item.roles as any[]) && (
                <NavItem 
                  key={item.path} 
                  item={item} 
                  isExpanded={isExpanded} 
                />
              )
            ))}

            {(hasRole(['master_admin']) || hasRole(['admin'])) && (
              <>
                <div className="my-3 border-t border-gray-200 dark:border-gray-700 mx-2" />
                <p className={cn("text-xs text-gray-500 dark:text-gray-400 font-medium mb-2 px-3", !isExpanded && "sr-only")}>
                  Administration
                </p>
                {adminNavItems.map(item => (
                  hasRole(item.roles as any[]) && (
                    <NavItem 
                      key={item.path} 
                      item={item} 
                      isExpanded={isExpanded} 
                    />
                  )
                ))}
              </>
            )}
          </nav>
        </div>

        <div className="sticky inset-x-0 bottom-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
          <div className="flex flex-col gap-2">
            {isExpanded && (
              <div className="flex items-center gap-3 rounded-md py-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {userData?.displayName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate max-w-[140px] text-gray-800 dark:text-gray-200">{userData?.displayName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {userData?.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout} 
                className={cn(
                  "gap-2 transition-all",
                  !isExpanded && "w-10 p-0 justify-center"
                )}
              >
                <LogOut className="h-4 w-4" />
                {isExpanded && <span>Logout</span>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="w-10 p-0 justify-center flex-shrink-0"
              >
                {isExpanded ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
