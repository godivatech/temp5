
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  actions 
}) => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} actions={actions} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto w-full animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
