
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItemProps {
  item: {
    title: string;
    icon: React.ComponentType<any>;
    path: string;
  };
  isExpanded: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, isExpanded, onClick }) => {
  const { title, icon: Icon, path } = item;
  
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          isActive 
            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-sm' 
            : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20',
          !isExpanded && 'justify-center px-2'
        )
      }
      onClick={onClick}
    >
      <Icon
        className={cn(
          'h-5 w-5 shrink-0 transition-transform',
          !isExpanded && 'h-6 w-6'
        )}
      />
      {isExpanded && (
        <span className="animate-fade-in whitespace-nowrap">{title}</span>
      )}
    </NavLink>
  );
};

export default NavItem;
