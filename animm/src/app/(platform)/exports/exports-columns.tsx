'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Copy, ExternalLink } from 'lucide-react';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Export, ExportStatusEnum } from '@/types/exports';
import ExportPreview from '@/components/export-preview';

// Helper function to extract filename from URL
const getFileNameFromUrl = (url: string): string => {
  try {
    // Remove query parameters and hash
    const cleanUrl = url.split('?')[0].split('#')[0];
    // Get the last part of the path
    const pathParts = cleanUrl.split('/');
    const fileName = pathParts[pathParts.length - 1];

    // If no filename found, return a default
    if (!fileName || fileName === '') {
      return 'Unknown file';
    }

    // Remove file extension for cleaner display
    const nameWithoutExtension = fileName.split('.')[0];
    return nameWithoutExtension || fileName;
  } catch {
    return 'Unknown file';
  }
};

export const ExportsColumns: ColumnDef<Export>[] = [
  {
    accessorKey: 'preview',
    header: 'Preview',
    enableGlobalFilter: false,
    cell: ({ row }) => {
      const exportItem = row.original;

      if (exportItem.status !== ExportStatusEnum.Finished || !exportItem.url) {
        return (
          <div className="flex items-center justify-center w-32 h-20 bg-muted rounded-md">
            <span className="text-xs text-muted-foreground">
              {exportItem.status === ExportStatusEnum.Pending
                ? 'Pending'
                : exportItem.status === ExportStatusEnum.InProgress
                ? 'Processing'
                : 'No preview'}
            </span>
          </div>
        );
      }

      return (
        <div className="flex items-center space-x-2">
          <ExportPreview url={exportItem.url} width={128} height={80} />
          <div className="flex flex-col gap-1">
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => {
                navigator.clipboard.writeText(exportItem.url);
                toast.success('URL copied to clipboard');
              }}
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => window.open(exportItem.url, '_blank')}
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    accessorFn: row => getFileNameFromUrl(row.url || ''),
    cell: ({ row }) => {
      const exportItem = row.original;
      if (!exportItem.url) {
        return <span className="text-muted-foreground">No file</span>;
      }
      return (
        <div className="text-sm font-medium">
          {getFileNameFromUrl(exportItem.url)}
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: 'url',
    header: 'URL',
    accessorFn: row => row.url || '',
    cell: ({ row }) => {
      const exportItem = row.original;
      if (!exportItem.url) {
        return <span className="text-muted-foreground">No URL</span>;
      }
      return (
        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
          {exportItem.url}
        </div>
      );
    },
    size: 250,
  },
  {
    accessorKey: 'dimensions',
    header: 'Dimensions',
    accessorFn: row => `${row.width} × ${row.height}`,
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {row.original.width} × {row.original.height}
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: 'enabled',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    enableGlobalFilter: false,
    cell: ({ row }) => {
      const status = row.original.status;
      if (status === ExportStatusEnum.Pending) {
        return (
          <div className="flex w-full justify-center">
            <Badge variant="default">Pending</Badge>
          </div>
        );
      } else if (status === ExportStatusEnum.InProgress) {
        return (
          <div className="flex w-full justify-center">
            <Badge variant="outline">In progress</Badge>
          </div>
        );
      } else if (status === ExportStatusEnum.Finished) {
        return (
          <div className="flex w-full justify-center">
            <Badge variant="outline">Finished</Badge>
          </div>
        );
      }
    },
    size: 80,
  },
];
