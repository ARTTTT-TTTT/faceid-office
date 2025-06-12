'use client';
import {
  CircleAlert,
  Loader2,
  LogOutIcon,
  MoreVerticalIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// import { useTheme } from 'next-themes';
import { useFetch } from '@/hooks/use-fetch';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

import { logout, me } from '@/utils/api/auth';

import { Me } from '@/types/auth';

export function NavUser() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  // const { theme, setTheme } = useTheme();

  const { data: userData, loading, error } = useFetch<Me>(me);

  if (loading)
    return (
      <div className='flex h-fit w-full items-center justify-center gap-2 rounded-md border p-2'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
        <span className='text-muted-foreground'>กำลังโหลด...</span>
      </div>
    );
  if (error || !userData)
    return (
      <div className='flex h-fit w-full items-center justify-center gap-2 rounded-md border p-2'>
        <CircleAlert className='h-6 w-6 animate-spin text-muted-foreground' />
        <span className='text-muted-foreground'>ไม่สามารถโหลดข้อมูลผู้ใช้</span>
      </div>
    );

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg grayscale'>
                <AvatarImage alt={userData.name} />
                <AvatarFallback className='rounded-lg'>ME</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>{userData.name}</span>
                <span className='truncate text-xs text-muted-foreground'>
                  {userData.email}
                </span>
              </div>
              <MoreVerticalIcon className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage alt={userData.name} />
                  <AvatarFallback className='rounded-lg'>ME</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>{userData.name}</span>
                  <span className='truncate text-xs text-muted-foreground'>
                    {userData.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            {/* <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserCircleIcon />
                บัญชี
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                การเงิน
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {theme === 'dark' ? (
                  <DropdownMenuItem onClick={() => setTheme('Light')}>
                    <Sun />
                    โหมดสว่าง
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon />
                    โหมดมืด
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuGroup>
            */}
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon />
              ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
