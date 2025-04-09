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
import {
  GeneratedAnimation,
  GeneratedAnimationStatusEnum,
} from '@/types/generatedAnimations';

export const GeneratedAnimationsColumns: ColumnDef<GeneratedAnimation>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
    size: undefined,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    size: undefined,
  },
  {
    accessorKey: 'baseTemplateId',
    header: 'Base Template',
    size: undefined,
  },

  {
    accessorKey: 'creationDate',
    header: 'Date',
    size: undefined,
  },
  {
    accessorKey: 'url',
    header: 'URL',
    cell: ({ row }) => {
      const url =
        'https://animm-ui.vercel.app/editor/' +
        row.original.id +
        '?generated=true';
      return (
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="url" className="sr-only">
              Link
            </Label>
            <Input id="url" defaultValue={url} readOnly />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-9"
            onClick={() => {
              navigator.clipboard.writeText(url);
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
          Activated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;
      //if (status == GeneratedAnimationStatusEnum.Approved) {
      if (true) {
        return (
          <div className="flex w-full justify-center">
            <Badge variant="default">Enabled</Badge>
          </div>
        );
      } else {
        return (
          <div className="flex w-full justify-center">
            <Badge variant="outline">Disabled</Badge>
          </div>
        );
      }
    },
    size: 80,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const url =
        'https://animm-ui.vercel.app/editor/' +
        row.original.id +
        '?generated=true&fullScreen=true';
      const urlEditor =
        'https://animm-ui.vercel.app/editor/' +
        row.original.id +
        '?generated=true';

      return (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
            <a rel="noopener noreferrer" target="_blank" href={url}>
              <Eye className="h-4 w-4" />
            </a>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={urlEditor}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="focus:!text-red-600 focus:!bg-red-100"
                onClick={() =>
                  toast.success(`URL ${row.original.name} has been deleted`)
                }
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    size: 50,
  },
];
