import Image from 'next/image';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { UserLogStatus } from '@/types/user-log';

interface AttendanceCardProps {
  name: string;
  image: string;
  timestamp: string;
  status: UserLogStatus;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  name,
  image,
  timestamp,
  status,
}: AttendanceCardProps) => {
  image;

  return (
    <Card>
      <CardContent className='flex flex-col items-center p-4'>
        <CardHeader className='relative size-24'>
          <Image
            src='https://picsum.photos/id/1005/200/300'
            alt='Profile'
            sizes='100%'
            fill
            className='rounded-full object-cover'
          />
        </CardHeader>
        <CardTitle className='mt-4 text-xl font-medium'>{name}</CardTitle>
        <CardDescription className='mt-2'>{timestamp}</CardDescription>
        <CardFooter
          className={`${
            status === UserLogStatus.ON_TIME
              ? 'bg-green-100 text-green-600'
              : status === UserLogStatus.LATE
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-gray-100'
          } mt-2 rounded-xl px-2 py-1 text-sm`}
        >
          {status === UserLogStatus.ON_TIME
            ? 'เข้างาน'
            : status === UserLogStatus.LATE
              ? 'สาย'
              : 'ไม่พบข้อมูล'}
        </CardFooter>
      </CardContent>
    </Card>
  );
};
