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
import { HeaderTitle } from '@/components/header-title';
import ConditionalLayout from './ConditionalLayout';

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
        <LoginChecker>
          <ConditionalLayout>{children}</ConditionalLayout>
        </LoginChecker>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
