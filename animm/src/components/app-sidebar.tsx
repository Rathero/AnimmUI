'use client';

import {
  ChevronDown,
  ChevronRight,
  BarChart3,
  Settings,
  FolderOpen,
  Download,
  Database,
  Building2,
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
import { platformStore } from '@/stores/platformStore';

export function AppSidebar() {
  const pathname = usePathname();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [expandedSubProjects, setExpandedSubProjects] = useState<Set<number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const { getAll } = useCollectionsService();

  const { authenticationResponse, setAuthenticationResponse } = platformStore(
    state => state
  );

  // Sub-projects for Road To Icons
  const roadToIconsSubProjects = [
    { code: 'es_ES', name: 'Spanish' },
    { code: 'it_IT', name: 'Italian' },
    { code: 'cs_CZ', name: 'Czech' },
    { code: 'fr_FR', name: 'French' },
  ];

  const toggleSubProjects = (collectionId: number) => {
    const newExpanded = new Set(expandedSubProjects);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedSubProjects(newExpanded);
  };

  const isRoadToIconsProject = (collectionName: string) => {
    return collectionName.toLowerCase().includes('road to icons');
  };

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
  }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {authenticationResponse?.id != 8 && (
          <div className="flex items-center justify-start pt-4">
            <Image
              src={'/Logo Animm.png'}
              alt="Animm Logo"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
        )}
        {authenticationResponse?.id == 8 && (
          <>
            <div className="flex items-center justify-start pt-4">
              <Image
                src={authenticationResponse?.picture}
                alt="Riot Projects"
                width={40}
                height={80}
                className="object-contain"
              />
              <h1 className="text-xl font-semibold ml-5">Riot Projects</h1>
            </div>
          </>
        )}
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
                    <FolderOpen className="w-4 h-4" />
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
                      const isRoadToIcons = isRoadToIconsProject(
                        collection.name
                      );
                      const hasSubProjects = isRoadToIcons;
                      const isSubProjectsExpanded = expandedSubProjects.has(
                        collection.id
                      );

                      return (
                        <div key={collection.id}>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              className={
                                hasSubProjects ? 'w-full justify-between' : ''
                              }
                            >
                              {hasSubProjects ? (
                                <div
                                  className="flex items-center justify-between w-full cursor-pointer"
                                  onClick={() =>
                                    toggleSubProjects(collection.id)
                                  }
                                >
                                  <Link
                                    href={`/collections/${collection.id}`}
                                    className="flex-1"
                                  >
                                    <span className="text-sm">
                                      {collection.name}
                                    </span>
                                  </Link>
                                  {isSubProjectsExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </div>
                              ) : (
                                <Link href={`/collections/${collection.id}`}>
                                  <span className="text-sm">
                                    {collection.name}
                                  </span>
                                </Link>
                              )}
                            </SidebarMenuButton>
                          </SidebarMenuItem>

                          {/* Sub-projects for Road To Icons */}
                          {hasSubProjects && isSubProjectsExpanded && (
                            <div className="ml-6 space-y-1">
                              {roadToIconsSubProjects.map(subProject => (
                                <SidebarMenuItem key={subProject.code}>
                                  <SidebarMenuButton asChild>
                                    <Link
                                      href={`/collections/${collection.id}/${subProject.code}`}
                                    >
                                      <ChevronRight className="w-3 h-3 mr-2" />
                                      <span className="text-sm">
                                        {subProject.code}
                                      </span>
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              ))}
                            </div>
                          )}
                        </div>
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
