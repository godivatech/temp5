
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top';
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  position = 'center',
  children,
  showCloseButton = true,
  closeOnOutsideClick = true,
  className,
  header,
  footer
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isVisible && !isOpen) return null;
  
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOutsideClick) {
      onClose();
    }
  };
  
  // Calculate size class
  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'w-[calc(100%-2rem)] h-[calc(100%-2rem)]'
  }[size];
  
  // Calculate position class
  const positionClass = {
    center: 'items-center',
    top: 'items-start pt-20'
  }[position];
  
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex justify-center overflow-auto bg-black/50 backdrop-blur-sm transition-opacity duration-300',
        positionClass,
        isOpen ? 'opacity-100' : 'opacity-0'
      )}
      onClick={handleOutsideClick}
    >
      <div
        className={cn(
          'relative w-full rounded-xl bg-white shadow-xl transition-all duration-300',
          sizeClass,
          size === 'full' ? 'rounded-xl m-4' : 'm-4',
          isOpen ? 'scale-100' : 'scale-95',
          className
        )}
      >
        {/* Modal header */}
        {(title || header || showCloseButton) && (
          <div className="flex items-center justify-between border-b px-6 py-4">
            {header || (
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            )}
            
            {showCloseButton && (
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Modal body */}
        <div className="px-6 py-4">
          {children}
        </div>
        
        {/* Modal footer */}
        {footer && (
          <div className="border-t px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);
  
  return { isOpen, open, close, toggle };
}
