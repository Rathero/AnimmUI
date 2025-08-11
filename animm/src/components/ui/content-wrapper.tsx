import { ReactNode } from 'react';

interface ContentWrapperProps {
  children: ReactNode;
  className?: string;
}

export function ContentWrapper({
  children,
  className = '',
}: ContentWrapperProps) {
  return (
    <div className={`h-full flex flex-col gap-4 p-4 ${className}`}>
      {children}
    </div>
  );
}
