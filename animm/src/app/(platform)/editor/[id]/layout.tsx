import type { Metadata } from 'next';
import './../../../globals.css';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

import { Toaster } from '@/components/ui/sonner';
import LoginChecker from './../../login/LoginChecker';

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
          <LoginChecker>
            <SidebarInset>
              <div className="h-screen w-full relative">{children}</div>
            </SidebarInset>
          </LoginChecker>
        </SidebarProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
