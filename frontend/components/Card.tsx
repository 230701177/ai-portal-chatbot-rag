import { ReactNode } from 'react';

interface CardProps {
  children?: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-card rounded border border-border shadow-card ${
        hover ? 'hover:shadow-card-hover transition-shadow duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
