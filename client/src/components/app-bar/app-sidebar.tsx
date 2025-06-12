'use client';

import { LayoutDashboardIcon, SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { NavMain } from '@/components/app-bar/nav-main';
import { NavSecondary } from '@/components/app-bar/nav-secondary';
import { NavUser } from '@/components/app-bar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const staticData = {
  navMain: [
    {
      title: 'แดชบอร์ด',
      url: 'dashboard',
      icon: LayoutDashboardIcon,
    },
  ],
  navSecondary: [
    {
      title: 'ตั้งค่า',
      url: 'settings',
      icon: SettingsIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='data-[slot=sidebar-menu-button]:!p-1.5'
            >
              <Link href=''>
                <span className='text-base font-semibold'>FACE ID OFFICE</span>
                {/* <section
                  className='relative mx-auto w-full max-w-xs md:max-w-sm lg:max-w-md'
                  style={{ height: '180px' }}
                >
                  <Image
                    src='/images/icon.png'
                    alt='Prototype'
                    fill
                    className='rounded-md object-contain'
                    priority
                  />
                </section> */}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain} />
        <NavSecondary items={staticData.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
