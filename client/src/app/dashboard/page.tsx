'use client';

import { CalendarIcon, ChevronDown } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const attendanceData = [
  {
    id: '1',
    name: 'สมชาย ใจดี',
    checkIn: '08:00',
    checkOut: '17:00',
    status: 'ตรงเวลา',
  },
  {
    id: '2',
    name: 'สมหญิง เก่งมาก',
    checkIn: '08:05',
    checkOut: '17:05',
    status: 'ตรงเวลา',
  },
  {
    id: '3',
    name: 'ธนากร มีชัย',
    checkIn: '09:15',
    checkOut: '17:00',
    status: 'สาย',
  },
  { id: '4', name: 'นารี สุขใจ', checkIn: '-', checkOut: '-', status: 'ลา' },
];

const attendanceColumns = [
  { header: 'ชื่อพนักงาน', accessorKey: 'name' },
  { header: 'เวลาเข้า', accessorKey: 'checkIn' },
  { header: 'เวลาออก', accessorKey: 'checkOut' },
  {
    header: 'สถานะ',
    accessorKey: 'status',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const status = row.getValue('status');
      return (
        <Badge
          variant={
            status === 'สาย' || status === 'ลา' ? 'destructive' : 'secondary'
          }
        >
          {status}
        </Badge>
      );
    },
  },
];

// ข้อมูลจำลองสำหรับสถิติ
const employeeStats = {
  total: 150,
  working: 120,
  onLeave: 5,
  absent: 2,
  onBreak: 3,
};

// ข้อมูลจำลองสำหรับการเข้า-ออกงานล่าสุด
const recentActivityData = [
  { id: '1', name: 'พิชิต ฝันดี', time: '10:55', type: 'เข้า' },
  { id: '2', name: 'สุดา สวยงาม', time: '10:40', type: 'กลับจากพัก' },
  { id: '3', name: 'อานนท์ มานะ', time: '10:00', type: 'พัก' },
  { id: '4', name: 'ลัดดา ว่องไว', time: '09:30', type: 'เข้า' },
];

const recentActivityColumns = [
  { header: 'ชื่อพนักงาน', accessorKey: 'name' },
  { header: 'เวลา', accessorKey: 'time' },
  { header: 'ประเภท', accessorKey: 'type' },
];

export default function DashboardPage() {
  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-6'>Dashboard</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card className='col-span-1'>
          <CardHeader>
            <CardTitle>ภาพรวมพนักงาน</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <p>
              จำนวนพนักงานทั้งหมด:{' '}
              <span className='font-semibold'>{employeeStats.total}</span> คน
            </p>
            <p>
              พนักงานที่กำลังทำงาน:{' '}
              <span className='font-semibold'>{employeeStats.working}</span> คน
            </p>
            <p>
              พนักงานที่ลาวันนี้:{' '}
              <span className='font-semibold'>{employeeStats.onLeave}</span> คน
            </p>
            <p>
              พนักงานที่ขาดงานวันนี้:{' '}
              <span className='font-semibold'>{employeeStats.absent}</span> คน
            </p>
            <p>
              พนักงานที่พัก:{' '}
              <span className='font-semibold'>{employeeStats.onBreak}</span> คน
            </p>
          </CardContent>
        </Card>

        <Card className='col-span-1 md:col-span-2 lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              การเข้า-ออกงานวันนี้
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' className='h-8 ml-2'>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {new Date().toLocaleDateString()}
                    <ChevronDown className='ml-2 h-4 w-4 opacity-50' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56'>
                  <DropdownMenuItem>
                    <Calendar className='border-none shadow' />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardTitle>
          </CardHeader>
          <CardContent className='overflow-auto'>
            <DataTable columns={attendanceColumns} data={attendanceData} />
            <p className='mt-4 text-sm text-muted-foreground'>
              <a href='/logs' className='underline'>
                ดู Log การเข้า-ออกงานทั้งหมดรายวัน
              </a>
            </p>
          </CardContent>
        </Card>

        <Card className='col-span-1'>
          <CardHeader>
            <CardTitle>การเข้า-ออกงานล่าสุด</CardTitle>
          </CardHeader>
          <CardContent className='overflow-auto'>
            <DataTable
              columns={recentActivityColumns}
              data={recentActivityData}
            />
          </CardContent>
        </Card>

        <Card className='col-span-1 md:col-span-1 lg:col-span-1'>
          <CardHeader>
            <CardTitle>สถิติการเข้างาน (รายเดือน - เมษายน 2025)</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <p>
              เข้างานตรงเวลา: <span className='font-semibold'>85%</span>
            </p>
            <p>
              เข้างานสาย: <span className='font-semibold'>10%</span>
            </p>
            <p>
              ขาดงาน: <span className='font-semibold'>5%</span>
            </p>
            <div className='h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 italic'>
              กราฟสถิติการเข้างานรายเดือน
            </div>
          </CardContent>
        </Card>

        <Card className='col-span-1 md:col-span-1 lg:col-span-1'>
          <CardHeader>
            <CardTitle>สถิติการลา (รายเดือน - เมษายน 2025)</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <p>
              ลาพักร้อน: <span className='font-semibold'>15</span> ครั้ง
            </p>
            <p>
              ลากิจ: <span className='font-semibold'>8</span> ครั้ง
            </p>
            <p>
              ลาป่วย: <span className='font-semibold'>3</span> ครั้ง
            </p>
            <div className='h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 italic'>
              กราฟสถิติการลา
            </div>
          </CardContent>
        </Card>

        <Card className='col-span-1 md:col-span-1 lg:col-span-1'>
          <CardHeader>
            <CardTitle>พนักงานที่เข้างานสาย/ขาดงานวันนี้</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <ul>
              <li>ธนากร มีชัย (09:15 - สาย)</li>
              <li>สมหมาย ไม่มา (ขาดงาน)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className='col-span-1 md:col-span-2 lg:col-span-2'>
          <CardHeader>
            <CardTitle>แนวโน้มการเข้า-ออกงาน (7 วันล่าสุด)</CardTitle>
          </CardHeader>
          <CardContent className='h-48 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 italic'>
            กราฟแนวโน้มการเข้า-ออกงาน
          </CardContent>
        </Card>

        <Card className='col-span-1 md:col-span-1 lg:col-span-1'>
          <CardHeader>
            <CardTitle>การกระจายตัวของเวลาเข้างาน</CardTitle>
          </CardHeader>
          <CardContent className='h-48 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 italic'>
            แผนภูมิการกระจายตัวของเวลาเข้างาน
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
