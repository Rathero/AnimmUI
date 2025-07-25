'use client';

import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbNavigationProps {
  breadcrumbs: Array<{ name: string; path: string[] }>;
  onPathChange: (path: string[]) => void;
  className?: string;
}

export default function BreadcrumbNavigation({
  breadcrumbs,
  onPathChange,
  className,
}: BreadcrumbNavigationProps) {
  return (
    <div className={`flex items-center space-x-1 text-sm ${className}`}>
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-sm hover:bg-accent/50"
            onClick={() => onPathChange(breadcrumb.path)}
          >
            {index === 0 ? <Home className="w-3 h-3 mr-1" /> : null}
            {breadcrumb.name}
          </Button>
        </div>
      ))}
    </div>
  );
}
