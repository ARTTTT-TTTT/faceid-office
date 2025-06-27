import { Metadata } from 'next';

import { AppSidebar } from '@/components/app-bar/app-sidebar';
import { SiteHeader } from '@/components/person/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export const metadata: Metadata = {
  title: 'Member',
  description: '',
};

export default function PersonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar variant='inset' />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
