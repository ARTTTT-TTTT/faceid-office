import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const DetectionTable: React.FC = () => {
  return (
    <Card className='overflow-hidden rounded-none'>
      <CardHeader className='sr-only'>
        <CardTitle>รายชื่อบุคคลล่าสุดที่พบ</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className='p-0'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[50%]'>ชื่อ</TableHead>
              <TableHead className='w-[50%] text-center'>เวลา</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className='w-full'>
              <TableCell className='whitespace-normal break-all'>
                item.person_id
              </TableCell>
              <TableCell className='text-center'>item.person_id</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
