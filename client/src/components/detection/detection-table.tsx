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

import { FaceTrackingResult } from '@/types/detection';

interface Props {
  trackingResults: FaceTrackingResult[];
}

export const DetectionTable: React.FC<Props> = ({ trackingResults }) => {
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
            {trackingResults.slice(0, 12).map((item, index) => (
              <TableRow className='w-full' key={index}>
                <TableCell className='whitespace-normal break-all'>
                  {item.person_id}
                </TableCell>
                <TableCell className='text-center'>{item.person_id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
