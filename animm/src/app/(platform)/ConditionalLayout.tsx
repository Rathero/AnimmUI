'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { HeaderTitle } from '@/components/header-title';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Check if current route is an editor route
  const isEditorRoute = pathname?.includes('/editor/');

  if (isEditorRoute) {
    // For editor routes, render without sidebar
    return <>{children}</>;
  }

  // For all other routes, render with sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-4 px-4 border-b">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <HeaderTitle />
          </div>
        </header>
        <div className="flex-1 min-h-0 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
