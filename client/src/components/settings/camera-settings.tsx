'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const CameraSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อกล้อง'),
  location: z.string().min(1, 'กรุณากรอกตำแหน่ง'),
});

type CameraFormType = z.infer<typeof CameraSchema>;

export const CameraSettings = () => {
  const [cameras, setCameras] = useState<CameraFormType[]>([
    { name: 'กล้องทางเข้า', location: 'ชั้น 1 อาคาร A' },
    { name: 'กล้องหลังอาคาร', location: 'ลานจอดรถ' },
  ]);

  const form = useForm<CameraFormType>({
    resolver: zodResolver(CameraSchema),
    defaultValues: {
      name: '',
      location: '',
    },
  });

  const handleAddCamera = (data: CameraFormType) => {
    setCameras((prev) => [...prev, data]);
    form.reset();
  };

  return (
    <Card className='w-full max-w-2xl'>
      <CardHeader>
        <CardTitle className='text-2xl text-blue-600'>ตั้งค่ากล้อง</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Existing Cameras */}
        <div>
          <h3 className='mb-2 text-lg font-medium text-gray-700'>
            กล้องที่มีอยู่
          </h3>
          <ul className='space-y-2'>
            {cameras.map((camera, idx) => (
              <li
                key={idx}
                className='flex justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700'
              >
                <span className='font-medium'>{camera.name}</span>
                <span className='text-sm text-gray-500'>{camera.location}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Add Camera Form */}
        <div className='border-t pt-6'>
          <h3 className='mb-4 text-lg font-medium text-gray-600'>
            เพิ่มกล้องใหม่
          </h3>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddCamera)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อกล้อง</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='เช่น กล้องหน้าอาคาร A'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='location'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ตำแหน่ง</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='เช่น ชั้น 1 หน้าเคาน์เตอร์'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                className='w-full bg-blue-500 hover:bg-blue-600'
              >
                เพิ่มกล้อง
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};
