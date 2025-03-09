
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  Package,
  FileText,
  LogOut,
  UserCog,
  FileClock,
  User,
  FileCheck,
  File,
  Clipboard
} from 'lucide-react';

export interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { userData, logout } = useAuth();
  
  // Check user role
  const isAdmin = userData?.role === 'admin' || userData?.role === 'master_admin';
  const isEmployee = userData?.role === 'employee';

  const navItems = [
    {
      title: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      href: '/dashboard',
      role: ['employee', 'admin', 'master_admin']
    },
    {
      title: 'Customers',
      icon: <Users className="h-5 w-5" />,
      href: '/dashboard/customers',
      role: ['employee', 'admin', 'master_admin']
    },
    {
      title: 'Products',
      icon: <Package className="h-5 w-5" />,
      href: '/dashboard/products',
      role: ['employee', 'admin', 'master_admin']
    },
    {
      title: 'Quotations',
      icon: <FileText className="h-5 w-5" />,
      href: '/dashboard/quotations',
      role: ['employee', 'admin', 'master_admin']
    },
    {
      title: 'Invoices',
      icon: <File className="h-5 w-5" />,
      href: '/dashboard/invoices',
      role: ['employee', 'admin', 'master_admin']
    },
    {
      title: 'Attendance',
      icon: <FileClock className="h-5 w-5" />,
      href: '/dashboard/attendance',
      role: ['employee', 'admin', 'master_admin']
    },
    {
      title: 'User Management',
      icon: <UserCog className="h-5 w-5" />,
      href: '/dashboard/users',
      role: ['admin', 'master_admin']
    },
    {
      title: 'Profile',
      icon: <User className="h-5 w-5" />,
      href: '/dashboard/profile',
      role: ['employee', 'admin', 'master_admin']
    }
  ];

  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.role.includes(userData?.role || 'employee')
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen fixed top-0 left-0 z-40 transition-all duration-300 shadow-lg",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {!collapsed && (
            <div className="text-xl font-bold text-indigo-400">Solar App</div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hover:bg-gray-700 text-gray-300"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center py-3 px-3 rounded-lg transition-colors",
                  location.pathname === item.href
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  collapsed ? "justify-center" : "justify-start"
                )}
              >
                <div className={collapsed ? "mx-auto" : "mr-3"}>{item.icon}</div>
                {!collapsed && <span>{item.title}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
              {userData?.displayName?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{userData?.displayName}</p>
                <p className="text-xs text-gray-400 capitalize">{userData?.role || 'User'}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors w-full",
              collapsed ? "justify-center py-3 px-0" : "justify-start"
            )}
          >
            <LogOut className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};
