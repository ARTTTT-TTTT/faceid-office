'use client';

import { type LucideIcon, ScanFace } from 'lucide-react';
import Link from 'next/link';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className='flex flex-col gap-2'>
        <SidebarMenu>
          <SidebarMenuItem className='flex items-center gap-2'>
            <SidebarMenuButton
              asChild
              tooltip='ไปยังหน้าตรวจสอบใบหน้า'
              className='animate-fade-in min-w-8 bg-primary text-primary-foreground transition-transform duration-300 ease-linear hover:scale-105 hover:bg-primary/90 hover:text-primary-foreground hover:shadow-lg active:bg-primary/90 active:text-primary-foreground'
            >
              <Link href='/detection'>
                <ScanFace />
                เริ่มตรวจสอบใบหน้า
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
