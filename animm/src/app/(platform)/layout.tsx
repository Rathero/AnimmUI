import type { Metadata } from 'next';
import './../globals.css';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

import { Toaster } from '@/components/ui/sonner';
import LoginChecker from './login/LoginChecker';

export const metadata: Metadata = {
  title: 'Animm.',
  description: 'Animations at scale',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SidebarProvider>
          <AppSidebar />
          <LoginChecker>
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 ease-linear">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                </div>
              </header>
              <div className="h-[calc(100vh-64px)] w-full p-4 pt-0 relative">
                {children}
              </div>
            </SidebarInset>
          </LoginChecker>
        </SidebarProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
