
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Menu,
  Sun,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  children?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { pathname } = useLocation();
  const { logout, userData, hasRole } = useAuth();
  const isMobile = useIsMobile();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleMobileSidebar = () => {
    setIsMobileExpanded(!isMobileExpanded);
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

  const isVisible = (item: { roles: string[] }) => {
    return hasRole(item.roles as any[]);
  };

  const renderNavItems = (items: typeof mainNavItems) => {
    return items.filter(isVisible).map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
          cn(
            'sidebar-item group',
            isActive && 'active'
          )
        }
        onClick={isMobile ? () => setIsMobileExpanded(false) : undefined}
      >
        <item.icon
          className={cn(
            'h-5 w-5 shrink-0 transition-transform group-hover:scale-110',
            pathname === item.path ? 'text-indigo-600' : 'text-gray-500'
          )}
        />
        {(isExpanded || (isMobile && isMobileExpanded)) && (
          <span>{item.title}</span>
        )}
      </NavLink>
    ));
  };

  // Sidebar for desktop
  const desktopSidebar = (
    <aside
      className={cn(
        'h-screen bg-white border-r border-indigo-100 transition-all duration-300 shadow-sm flex flex-col',
        isExpanded ? 'w-64' : 'w-20'
      )}
    >
      <div className="h-16 flex items-center px-4 border-b border-indigo-100">
        {isExpanded ? (
          <div className="flex items-center">
            <Sun className="h-6 w-6 text-indigo-500 mr-2" />
            <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-green-500">Prakash Green</h2>
          </div>
        ) : (
          <div className="flex w-full justify-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-green-500 text-white flex items-center justify-center">
              <span className="text-lg font-bold">P</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto py-2 px-3">
        <nav className="flex flex-col gap-1">
          {renderNavItems(mainNavItems)}

          {(hasRole(['master_admin']) || hasRole(['admin'])) && (
            <>
              <div className="my-2 border-t border-indigo-100" />
              <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {isExpanded ? 'Administration' : 'Admin'}
              </p>
              {renderNavItems(adminNavItems)}
            </>
          )}
        </nav>
      </div>

      <div className="border-t border-indigo-100 bg-white p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 rounded-md py-1">
            {isExpanded && (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-green-500 text-white flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {userData?.displayName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{userData?.displayName}</span>
                    <span className="text-xs text-gray-500 capitalize">
                      {userData?.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </>
            )}
            <button
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-md hover:bg-indigo-50 text-indigo-500"
              onClick={toggleSidebar}
            >
              {isExpanded ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout} 
            className="w-full gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-300"
          >
            <LogOut className="h-4 w-4" />
            {isExpanded && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );

  // Sidebar for mobile
  const mobileSidebar = (
    <>
      <button
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-md bg-white shadow-md text-indigo-600"
        onClick={toggleMobileSidebar}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile sidebar overlay */}
      {isMobileExpanded && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileExpanded(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 h-screen w-72 bg-white border-r border-indigo-100 shadow-xl transition-transform duration-300',
          isMobileExpanded ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b border-indigo-100">
            <div className="flex items-center">
              <Sun className="h-6 w-6 text-indigo-500 mr-2" />
              <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-green-500">Prakash Green</h2>
            </div>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-indigo-50 text-indigo-500"
              onClick={() => setIsMobileExpanded(false)}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto py-2 px-3">
            <nav className="flex flex-col gap-1">
              {renderNavItems(mainNavItems)}

              {(hasRole(['master_admin']) || hasRole(['admin'])) && (
                <>
                  <div className="my-2 border-t border-indigo-100" />
                  <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    Administration
                  </p>
                  {renderNavItems(adminNavItems)}
                </>
              )}
            </nav>
          </div>

          <div className="border-t border-indigo-100 bg-white p-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 rounded-md py-1">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-green-500 text-white flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {userData?.displayName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{userData?.displayName}</span>
                    <span className="text-xs text-gray-500 capitalize">
                      {userData?.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout} 
                className="w-full gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );

  return (
    <>
      {isMobile ? mobileSidebar : desktopSidebar}
    </>
  );
};
