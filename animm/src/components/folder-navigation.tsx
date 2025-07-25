'use client';

import { ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FolderNode {
  name: string;
  children: Record<string, FolderNode>;
  exports: string[];
  isOpen?: boolean;
}

interface FolderNavigationProps {
  folderStructure: FolderNode;
  currentPath: string[];
  onPathChange: (path: string[]) => void;
  onToggleFolder?: (path: string[]) => void;
  className?: string;
}

export default function FolderNavigation({
  folderStructure,
  currentPath,
  onPathChange,
  onToggleFolder,
  className,
}: FolderNavigationProps) {
  const renderFolder = (
    node: FolderNode,
    path: string[],
    level: number = 0
  ) => {
    const folderNames = Object.keys(node.children);
    const isCurrentFolder =
      path.length === currentPath.length &&
      path.every((segment, index) => segment === currentPath[index]);

    return (
      <div className="space-y-1">
        {folderNames.map(folderName => {
          const childNode = node.children[folderName];
          const childPath = [...path, folderName];
          const isChildOpen = childNode.isOpen;
          const hasChildren = Object.keys(childNode.children).length > 0;
          const hasExports = childNode.exports.length > 0;

          return (
            <div key={folderName}>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'flex-1 justify-start h-8 px-2 text-sm',
                    isCurrentFolder &&
                      path.length === currentPath.length - 1 &&
                      currentPath[currentPath.length - 1] === folderName
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  )}
                  onClick={() => onPathChange(childPath)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div
                      className="flex items-center"
                      style={{ paddingLeft: `${level * 16}px` }}
                    >
                      {hasChildren && (
                        <ChevronRight
                          className={cn(
                            'w-3 h-3 transition-transform',
                            isChildOpen && 'rotate-90'
                          )}
                        />
                      )}
                    </div>
                    {hasChildren || hasExports ? (
                      <FolderOpen className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Folder className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="truncate">{folderName}</span>
                    {(hasChildren || hasExports) && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {hasChildren
                          ? Object.keys(childNode.children).length
                          : childNode.exports.length}
                      </span>
                    )}
                  </div>
                </Button>
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-accent/50"
                    onClick={e => {
                      e.stopPropagation();
                      onToggleFolder?.(childPath);
                    }}
                  >
                    <ChevronRight
                      className={cn(
                        'w-3 h-3 transition-transform',
                        isChildOpen && 'rotate-90'
                      )}
                    />
                  </Button>
                )}
              </div>
              {hasChildren && isChildOpen && (
                <div className="ml-4">
                  {renderFolder(childNode, childPath, level + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="text-sm font-medium text-muted-foreground px-2">
        Folders
      </div>
      {renderFolder(folderStructure, [])}
    </div>
  );
}
