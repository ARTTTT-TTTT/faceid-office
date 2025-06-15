'use client';

import {
  type LucideIcon,
  AlarmClockOff,
  Loader2,
  ScanFace,
} from 'lucide-react';
import Link from 'next/link';

import { useFetch } from '@/hooks/use-fetch';
import { useSessionCountdown } from '@/hooks/use-session-countdown';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { getSessionStatus } from '@/utils/api/session';
import { formatTime } from '@/utils/format-time';

import { Session } from '@/types/session';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const { data: sessionData, loading: sessionLoading } =
    useFetch<Session>(getSessionStatus);

  const { remainingTTL, isSessionActive } = useSessionCountdown(
    sessionData,
    sessionLoading,
  );

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
            {sessionLoading ? (
              <div className='flex h-9 w-16 items-center justify-center rounded-md border px-2 text-muted-foreground'>
                <Loader2 className='animate-spin' />
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className='flex h-9 w-16 items-center justify-center rounded-md border px-2 font-medium shadow-sm'>
                    {isSessionActive ? (
                      formatTime(remainingTTL, false)
                    ) : (
                      <AlarmClockOff className='text-red-700' />
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {isSessionActive
                    ? `เซสชั่นกำลังเปิดอยู่`
                    : `ไม่มีเซสชั่นที่ใช้งานอยู่`}
                  <br />
                  {isSessionActive
                    ? `เหลือเวลาอีก ${formatTime(
                        remainingTTL,
                      )} ชั่วโมง เซสชั่นจะถูกปิดลง`
                    : `กด "เริ่มตรวจสอบใบหน้า" เพื่อจัดการกับเซสชั่นในปัจจุบัน`}
                </TooltipContent>
              </Tooltip>
            )}
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
