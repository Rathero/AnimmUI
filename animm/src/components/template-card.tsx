'use client';

import Image from 'next/image';
import { Folder, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DropdownMenuGroup } from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';

import { Template } from '@/types/collections';

interface TemplateCardProps {
  template: Template;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  template.thumbnail === ''
    ? (template.thumbnail = '/img/placeholder.svg')
    : '';

  const handleMouseEnter = (e: { target: any }) => {
    const vid = e.target;
    vid.muted = true;
    vid.play();
  };

  const handleMouseLeave = (e: { target: any }) => {
    const vid = e.target;
    vid.muted = false;
    vid.currentTime = 0;
    vid.pause();
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg hover:shadow-slate-500/10">
      <Link href={'/editor/' + template.id} className="cursor-pointer">
        <CardHeader className="p-0">
          <div className="relative w-full h-44">
            <video
              className="absolute size-full object-cover transition-opacity opacity-0 hover:!opacity-100 z-10"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <source src={template.video} type="video/mp4" />
            </video>
            <Image
              src={template.thumbnail}
              alt="Template cover"
              priority
              fill
              className="absolute"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-4">
        <div className="flex justify-between items-center gap-3">
          <div className="flex gap-4 items-center">
            <div>
              <div className="rounded-md border p-3">
                <Folder className="w-5 h-5 text-muted-foreground/70" />
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium tracking-normal line-clamp-1">
                {template.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1"></p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-4">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <Link href={'/editor/' + template.id}>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="focus:!text-red-600 focus:!bg-red-100">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
