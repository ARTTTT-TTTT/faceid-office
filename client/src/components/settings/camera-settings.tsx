'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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

import { createCamera } from '@/utils/api/camera';

import { AdminSettings } from '@/types/admin';

const CameraSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อกล้อง'),
  location: z.string().min(1, 'กรุณากรอกตำแหน่ง'),
});

type CameraFormType = z.infer<typeof CameraSchema>;

interface Props {
  settingsData: AdminSettings;
  setSettingsData: React.Dispatch<React.SetStateAction<AdminSettings | null>>;
}

export const CameraSettings: React.FC<Props> = ({
  settingsData,
  setSettingsData,
}) => {
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const form = useForm<CameraFormType>({
    resolver: zodResolver(CameraSchema),
    defaultValues: {
      name: '',
      location: '',
    },
  });
  const { isDirty } = form.formState;

  const onSubmit = async (payload: CameraFormType) => {
    setIsSubmitLoading(true);
    try {
      const newCamera = await createCamera(payload);

      setSettingsData((prevSettings) => {
        if (!prevSettings) return prevSettings;
        return {
          ...prevSettings,
          cameras: [...(prevSettings.cameras || []), newCamera],
          sessionDuration: prevSettings.sessionDuration,
        };
      });

      form.reset();
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการเพิ่มกล้อง', {
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setIsSubmitLoading(false);
    }
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
            {settingsData.cameras && settingsData.cameras.length > 0 ? (
              settingsData.cameras.map((camera) => (
                <li
                  key={camera.id}
                  className='flex justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700'
                >
                  <span className='font-medium'>{camera.name}</span>
                  <span className='text-sm text-gray-500'>
                    {camera.location}
                  </span>
                </li>
              ))
            ) : (
              <p className='text-gray-500'>ยังไม่มีกล้องในระบบ</p>
            )}
          </ul>
        </div>

        <Separator />

        {/* Add Camera Form */}
        <Form {...form}>
          <h3 className='text-lg font-medium text-gray-600'>เพิ่มกล้องใหม่</h3>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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

            {isDirty && (
              <Button
                type='submit'
                className='w-full bg-blue-500 hover:bg-blue-600'
                disabled={isSubmitLoading}
              >
                {isSubmitLoading ? (
                  <span className='flex items-center justify-center gap-2'>
                    <Loader2 className='size-6 animate-spin text-muted-foreground' />
                    กำลังเพิ่ม...
                  </span>
                ) : (
                  'เพิ่มกล้อง'
                )}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
