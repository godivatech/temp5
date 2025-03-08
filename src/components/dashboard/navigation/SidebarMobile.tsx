
import React, { useState } from 'react';
import { ChevronLeft, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import NavItem from './NavItem';

interface SidebarMobileProps {
  mainNavItems: any[];
  adminNavItems: any[];
  handleLogout: () => void;
}

const SidebarMobile: React.FC<SidebarMobileProps> = ({ 
  mainNavItems, 
  adminNavItems, 
  handleLogout 
}) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const { userData, hasRole } = useAuth();

  const toggleMobileSidebar = () => {
    setIsMobileExpanded(!isMobileExpanded);
  };

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-md bg-white shadow-md dark:bg-gray-800"
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
          'fixed inset-y-0 left-0 z-50 h-screen w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-xl transition-transform duration-300 ease-in-out',
          isMobileExpanded ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Prakash Green</h2>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMobileExpanded(false)}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto py-4 px-3">
            <nav className="flex flex-col gap-1.5">
              {mainNavItems.map(item => (
                hasRole(item.roles as any[]) && (
                  <NavItem 
                    key={item.path} 
                    item={item} 
                    isExpanded={true} 
                    onClick={() => setIsMobileExpanded(false)}
                  />
                )
              ))}

              {(hasRole(['master_admin']) || hasRole(['admin'])) && (
                <>
                  <div className="my-3 border-t border-gray-200 dark:border-gray-700 mx-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2 px-3">
                    Administration
                  </p>
                  {adminNavItems.map(item => (
                    hasRole(item.roles as any[]) && (
                      <NavItem 
                        key={item.path} 
                        item={item} 
                        isExpanded={true}
                        onClick={() => setIsMobileExpanded(false)}
                      />
                    )
                  ))}
                </>
              )}
            </nav>
          </div>

          <div className="sticky inset-x-0 bottom-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 rounded-md py-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {userData?.displayName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{userData?.displayName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {userData?.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="w-full gap-2">
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarMobile;
