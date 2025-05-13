'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowLeft, Unlock } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import logger from '@/lib/logger';
import { useFetch } from '@/hooks/useFetch';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  createSetting,
  fetchRedisStatus,
  fetchSetting,
  startRedis,
  stopRedis,
  updateSetting,
} from '@/app/api/setting/route';

import {
  RedisStartStatus,
  RedisStatus,
  RedisStopStatus,
  Setting,
} from '@/types/setting';

const FormSchema = z.object({
  work_start_time: z.coerce
    .number({
      required_error: 'Please enter the work start hour.',
      invalid_type_error: 'Value must be a number.',
    })
    .int({ message: 'Value must be an integer.' })
    .min(1, { message: 'Must be greater than or equal to 1.' })
    .max(23, { message: 'Must not exceed 23.' }),

  user_log_expire_seconds: z.coerce
    .number({
      required_error: 'Please enter the session expiration time.',
      invalid_type_error: 'Value must be a number.',
    })
    .refine((val) => val >= 1 && val <= 168, {
      message: 'Value must be between 1 and 168 hours.',
    })
    .refine((val) => /^\d+(\.\d)?$/.test(val.toString()), {
      message: 'Up to 1 decimal place is allowed.',
    }),
});

// !FIX Validate ข้อมูลใน field ไม่ขึ้นแจ้งเตือน

export default function SettingPage() {
  type FormSchemaType = z.infer<typeof FormSchema>;

  const {
    data: settingData,
    refetch: refetchSetting,
    loading: loadingSetting,
  } = useFetch<Setting | null>(fetchSetting);

  const fetchRedis = useCallback(() => {
    if (!settingData) return Promise.resolve(null);
    return fetchRedisStatus(settingData._id);
  }, [settingData]);

  const {
    data: redisStatusData,
    refetch: refetchRedisStatus,
    loading: loadingRedisStatus,
  } = useFetch<RedisStartStatus | RedisStopStatus | null>(fetchRedis);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
  });

  const handleStartSession = async () => {
    if (!settingData) return;
    try {
      const response = await startRedis(settingData._id);
      if (response) {
        refetchRedisStatus();
      }
    } catch (error) {
      logger(error, '[SettingPage] handleStartSession');
    }
  };

  const handleStopSession = async () => {
    if (!settingData) return;

    try {
      const response = await stopRedis(settingData._id);
      if (response) {
        refetchRedisStatus();
      }
    } catch (error) {
      logger(error, '[SettingPage] handleStopSession');
    }
  };

  const onSubmit = async (payload: FormSchemaType) => {
    if (!payload) return;

    try {
      let response = null;

      if (!settingData) {
        response = await createSetting({
          user_log_expire_seconds: 60 * 60 * payload.user_log_expire_seconds,
          work_start_time: payload.work_start_time,
        });
      }

      if (settingData) {
        response = await updateSetting({
          id: settingData._id,
          user_log_expire_seconds: 60 * 60 * payload.user_log_expire_seconds,
          work_start_time: payload.work_start_time,
        });
      }

      if (response) {
        refetchSetting();
      }
    } catch (error) {
      logger(error, '[SettingPage] onSubmit');
    }
  };

  const { reset } = form;

  useEffect(() => {
    if (settingData) {
      reset({
        user_log_expire_seconds: settingData.user_log_expire_seconds / 3600,
        work_start_time: settingData.work_start_time,
      });
    }
  }, [settingData, reset]);

  if (loadingRedisStatus || loadingSetting) return;

  return (
    <main className='grid grid-cols-1 gap-4 p-4 bg-gray-200 h-screen'>
      <Card>
        <CardContent className='p-4 flex flex-col items-center overflow-y-auto overflow-x-hidden'>
          <CardHeader>
            <CardTitle className='text-4xl font-extrabold text-gray-800'>
              Settings
            </CardTitle>
          </CardHeader>
          <CardDescription>
            Session status:
            <span
              className={`${
                redisStatusData?.status === RedisStatus.START
                  ? 'text-green-600'
                  : redisStatusData?.status === RedisStatus.END
                  ? 'text-yellow-600'
                  : 'text-muted-foreground'
              } ml-1 text-sm`}
            >
              {redisStatusData?.status === RedisStatus.START
                ? 'start'
                : redisStatusData?.status === RedisStatus.END
                ? 'stop'
                : 'not found'}
            </span>
          </CardDescription>
          <section className='flex flex-col gap-4 items-center justify-center mt-4'>
            <Button
              className={`bg-blue-500 font-semibold hover:bg-blue-600 transition duration-200 w-full ${
                !settingData ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleStartSession}
              disabled={!settingData}
            >
              Start
            </Button>

            <Button
              className={`bg-red-500 font-semibold hover:bg-red-600 transition duration-200 w-full ${
                !settingData ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleStopSession}
              disabled={!settingData}
            >
              Stop
            </Button>
            {!settingData ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className='flex items-center justify-center gap-1'>
                    <Unlock className='size-4' />
                    <span>Unlock</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Please set the Time to work and Session duration
                    <br />
                    to enable session start and stop.
                  </TooltipContent>
                </Tooltip>
                <ArrowDown className='h-6 size-6 animate-bounce text-blue-500' />
              </TooltipProvider>
            ) : (
              <Separator className='h-0.5' />
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6  w-40'
              >
                <FormField
                  control={form.control}
                  name='work_start_time'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Time to work{' '}
                        <span className='text-muted-foreground'>
                          (e.g. 9 AM)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='1'
                          min={1}
                          max={23}
                          placeholder='9 AM'
                          onInput={(e) => {
                            const input = e.currentTarget;
                            let value = input.value;

                            value = value.replace(/\s/g, '');

                            value = value.split('.')[0];

                            input.value = value;
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className='sr-only'>
                        Time to work in hours.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='user_log_expire_seconds'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Session duration{' '}
                        <span className='text-muted-foreground'>(hour)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.1'
                          min={1}
                          max={168}
                          placeholder='2 hour'
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
                      <FormDescription className='sr-only'>
                        The duration of the session is in hours. If you want to
                        specify minutes, enter 2.5, which will give you 2 hours
                        and 30 minutes.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  className='bg-green-500 font-semibold hover:bg-green-600 transition duration-200 w-full'
                >
                  Confirm
                </Button>
              </form>
            </Form>
          </section>
          <CardFooter>
            <Link
              href='/detection'
              className='mt-8 text-blue-500 flex items-center justify-center gap-1'
            >
              <ArrowLeft className='size-6' />
              Go to Detection
            </Link>
          </CardFooter>
        </CardContent>
      </Card>
    </main>
  );
}
