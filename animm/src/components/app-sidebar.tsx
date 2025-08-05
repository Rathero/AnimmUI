'use client';

import {
  Link2,
  GalleryVertical,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Settings,
  FolderOpen,
  Download,
  Database,
} from 'lucide-react';
import { NavUser } from './sideBar/nav-user';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import useCollectionsService from '@/app/services/CollectionsService';
import { Collection } from '@/types/collections';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarRail,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const pathname = usePathname();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { getAll } = useCollectionsService();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await getAll();
        if (response?.Result) {
          setCollections(response.Result);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, [getAll]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-start pt-4">
          <Image
            src={'/Logo Animm.png'}
            alt="Animm Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Projects Section */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <GalleryVertical className="w-4 h-4" />
                    <span>Projects</span>
                  </div>
                  {isProjectsExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Projects Submenu */}
              {isProjectsExpanded && (
                <div className="ml-6 space-y-1">
                  {isLoading ? (
                    <div className="px-3 py-1 text-sm text-muted-foreground">
                      Loading...
                    </div>
                  ) : collections.length === 0 ? (
                    <div className="px-3 py-1 text-sm text-muted-foreground">
                      No projects
                    </div>
                  ) : (
                    collections.map(collection => {
                      const isActive =
                        pathname === `/collections/${collection.id}`;
                      return (
                        <SidebarMenuItem key={collection.id}>
                          <SidebarMenuButton asChild isActive={isActive}>
                            <Link href={`/collections/${collection.id}`}>
                              <span className="text-sm">{collection.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })
                  )}
                </div>
              )}

              {/* Brand Assets */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <FolderOpen className="w-4 h-4" />
                    <span>Brand Assets (Coming Soon)</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Exports */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/exports'}>
                  <Link href="/exports">
                    <Download className="w-4 h-4" />
                    <span>Exports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Data */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <BarChart3 className="w-4 h-4" />
                    <span>Data (Coming Soon)</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Settings */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <Settings className="w-4 h-4" />
                    <span>Settings (Coming Soon)</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
