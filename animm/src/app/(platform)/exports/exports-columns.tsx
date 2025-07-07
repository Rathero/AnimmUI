'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Copy, Eye } from 'lucide-react';
import { MoreHorizontal } from 'lucide-react';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Export, ExportBatch, ExportStatusEnum } from '@/types/exports';

export const ExportsColumns: ColumnDef<Export>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
    size: undefined,
  },
  {
    accessorKey: 'width',
    header: 'Width',
    size: undefined,
  },
  {
    accessorKey: 'height',
    header: 'Height',
    size: undefined,
  },
  {
    accessorKey: 'url',
    header: 'URL',
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="url" className="sr-only">
              Link
            </Label>
            <Input id="url" defaultValue={row.original.url} readOnly />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-9"
            onClick={() => {
              navigator.clipboard.writeText(row.original.url);
              toast.success('URL has been copied');
            }}
          >
            <span className="sr-only">Copy</span>
            <Copy />
          </Button>
        </div>
      );
    },
    size: undefined,
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
