'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { updateSessionDuration } from '@/utils/api/admin';

import { AdminSettings, updateSessionDurationPayload } from '@/types/admin';

const SessionSchema = z.object({
  session_duration: z.coerce
    .number({
      required_error: 'กรุณาระบุระยะเวลา',
      invalid_type_error: 'ต้องเป็นตัวเลขเท่านั้น',
    })
    .refine((val) => val >= 1 && val <= 168, {
      message: 'ต้องอยู่ระหว่าง 1 ถึง 168 ชั่วโมง',
    })
    .refine((val) => /^\d+(\.\d)?$/.test(val.toString()), {
      message: 'ใส่ทศนิยมได้ไม่เกิน 1 ตำแหน่ง',
    }),
});

type SessionFormType = z.infer<typeof SessionSchema>;

interface Props {
  settingsData: AdminSettings;
  setSettingsData: (settingsData: AdminSettings) => void;
}

export const SessionSettings: React.FC<Props> = ({
  settingsData,
  setSettingsData,
}) => {
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const form = useForm<SessionFormType>({
    resolver: zodResolver(SessionSchema),
    defaultValues: {
      session_duration: settingsData.sessionDuration / 3600,
    },
  });
  const { isDirty } = form.formState;

  const onSubmit = async (data: SessionFormType) => {
    setIsSubmitLoading(true);
    const payload: updateSessionDurationPayload = {
      sessionDuration: Math.round(data.session_duration * 3600),
    };

    try {
      const updatedSettings = await updateSessionDuration(payload);
      setSettingsData(updatedSettings);
      form.reset(data);
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการอัปเดต', {
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

  useEffect(() => {
    if (settingsData.sessionDuration !== undefined) {
      form.reset({
        session_duration: settingsData.sessionDuration / 3600,
      });
    }
  }, [settingsData.sessionDuration, form]);

  return (
    <Card className='w-full max-w-2xl'>
      <CardHeader>
        <CardTitle className='text-2xl text-green-600'>
          ตั้งค่าเซสชั่น
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='session_duration'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ระยะเวลาเซสชั่น (ชั่วโมง)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.1'
                      min={1}
                      max={168}
                      placeholder='เช่น 2.5 (2 ชม. 30 นาที)'
                      onInput={(e) => {
                        const input = e.currentTarget;
                        let value = input.value;
                        value = value.replace(/\s/g, '');
                        if (value.includes('.')) {
                          const [intPart, decPart] = value.split('.');
                          if (decPart.length > 1) {
                            value = `${intPart}.${decPart.slice(0, 1)}`;
                          }
                        }
                        input.value = value;
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    กำหนดระยะเวลาเป็นชั่วโมง เช่น 2.5 = 2 ชั่วโมง 30 นาที
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isDirty && (
              <Button
                type='submit'
                className='w-full bg-green-500 hover:bg-green-600'
                disabled={isSubmitLoading || !isDirty}
              >
                {isSubmitLoading ? (
                  <span className='flex items-center justify-center gap-2'>
                    <Loader2 className='size-6 animate-spin text-muted-foreground' />
                    กำลังบันทึก...
                  </span>
                ) : (
                  'ยืนยัน'
                )}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
