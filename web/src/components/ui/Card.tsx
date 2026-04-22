import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({ children, className = '', onClick, hover = false }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm
        ${hover || onClick ? 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : ''}
        ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
