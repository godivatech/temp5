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
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            isActive 
              ? 'bg-primary/10 text-primary' 
              : 'text-gray-600 hover:text-primary hover:bg-primary/5',
            !isExpanded && !isMobile && 'justify-center px-2'
          )
        }
        onClick={isMobile ? () => setIsMobileExpanded(false) : undefined}
      >
        <item.icon
          className={cn(
            'h-5 w-5 shrink-0 transition-transform',
            !isExpanded && !isMobile && 'h-6 w-6'
          )}
        />
        {(isExpanded || (isMobile && isMobileExpanded)) && (
          <span className="animate-fade-in">{item.title}</span>
        )}
      </NavLink>
    ));
  };

  const desktopSidebar = (
    <aside
      className={cn(
        'h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out sticky top-0 left-0 z-30',
        isExpanded ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center px-4 border-b border-gray-200">
          {isExpanded ? (
            <h2 className="text-lg font-bold text-primary">Prakash Green</h2>
          ) : (
            <div className="flex w-full justify-center">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <span className="text-lg font-bold">P</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto py-4 px-3">
          <nav className="flex flex-col gap-1.5">
            {renderNavItems(mainNavItems)}

            {(hasRole(['master_admin']) || hasRole(['admin'])) && (
              <>
                <div className="my-3 border-t border-gray-200 mx-2" />
                <p className={cn("text-xs text-gray-500 font-medium mb-2 px-3", !isExpanded && "sr-only")}>
                  Administration
                </p>
                {renderNavItems(adminNavItems)}
              </>
            )}
          </nav>
        </div>

        <div className="sticky inset-x-0 bottom-0 border-t border-gray-200 bg-white p-3">
          <div className="flex flex-col gap-2">
            {isExpanded && (
              <div className="flex items-center gap-3 rounded-md py-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {userData?.displayName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate max-w-[140px]">{userData?.displayName}</span>
                    <span className="text-xs text-gray-500 capitalize">
                      {userData?.role.replace('_', ' ')}
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

  const mobileSidebar = (
    <>
      <button
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-md bg-white shadow-md"
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
          'fixed inset-y-0 left-0 z-50 h-screen w-72 bg-white border-r border-gray-200 shadow-xl transition-transform duration-300 ease-in-out',
          isMobileExpanded ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-primary">Prakash Green</h2>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100"
              onClick={() => setIsMobileExpanded(false)}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto py-4 px-3">
            <nav className="flex flex-col gap-1.5">
              {renderNavItems(mainNavItems)}

              {(hasRole(['master_admin']) || hasRole(['admin'])) && (
                <>
                  <div className="my-3 border-t border-gray-200 mx-2" />
                  <p className="text-xs text-gray-500 font-medium mb-2 px-3">
                    Administration
                  </p>
                  {renderNavItems(adminNavItems)}
                </>
              )}
            </nav>
          </div>

          <div className="sticky inset-x-0 bottom-0 border-t border-gray-200 bg-white p-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 rounded-md py-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {userData?.displayName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{userData?.displayName}</span>
                    <span className="text-xs text-gray-500 capitalize">
                      {userData?.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="w-full gap-2">
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
