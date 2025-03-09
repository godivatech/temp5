
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Users, 
  Package2, 
  FileText, 
  FileInvoice, 
  Clock, 
  UserCog,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/lib/firebase';
import { toast } from 'sonner';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { userData, hasRole } = useAuth();
  
  const isAdmin = hasRole(['master_admin', 'admin']);
  const isMasterAdmin = hasRole(['master_admin']);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error('Failed to log out');
      console.error(error);
    }
  };

  // Sidebar menu items
  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/dashboard',
      active: location.pathname === '/dashboard',
    },
    {
      icon: Users,
      label: 'Customers',
      path: '/dashboard/customers',
      active: location.pathname.includes('/dashboard/customers'),
    },
    {
      icon: Package2,
      label: 'Products',
      path: '/dashboard/products',
      active: location.pathname.includes('/dashboard/products'),
    },
    {
      icon: FileText,
      label: 'Quotations',
      path: '/dashboard/quotations',
      active: location.pathname.includes('/dashboard/quotations'),
    },
    {
      icon: FileInvoice,
      label: 'Invoices',
      path: '/dashboard/invoices',
      active: location.pathname.includes('/dashboard/invoices'),
      visible: true, // Now accessible to all users
    },
    {
      icon: Clock,
      label: 'Attendance',
      path: '/dashboard/attendance',
      active: location.pathname.includes('/dashboard/attendance'),
      visible: isAdmin,
    },
    {
      icon: UserCog,
      label: 'Users',
      path: '/dashboard/users',
      active: location.pathname.includes('/dashboard/users'),
      visible: isMasterAdmin,
    },
  ];

  return (
    <aside 
      className={cn(
        "fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-sm z-30 transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          {!collapsed && (
            <h1 className="text-xl font-bold text-indigo-700">Solar CRM</h1>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className={cn("ml-auto", collapsed && "mx-auto")}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col gap-1 p-2">
            {menuItems.map((item) => 
              // Only show items that should be visible
              (item.visible === undefined || item.visible) && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-200",
                    item.active 
                      ? "bg-indigo-50 text-indigo-600 font-medium border-l-2 border-indigo-600" 
                      : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 border-l-2 border-transparent",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", item.active ? "text-indigo-600" : "text-gray-500")} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            )}
          </nav>
        </div>
        
        <div className="p-3 border-t border-gray-100">
          {!collapsed && (
            <div className="mb-3 px-3 py-2">
              <div className="text-sm font-semibold text-gray-700">{userData?.displayName}</div>
              <div className="text-xs text-gray-500">{userData?.role}</div>
            </div>
          )}
          <Button 
            variant="ghost" 
            size={collapsed ? "icon" : "default"} 
            className={cn(
              "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50",
              collapsed && "justify-center"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
};
