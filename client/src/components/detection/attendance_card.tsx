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
      <CardContent className='p-4 flex flex-col items-center'>
        <CardHeader className='size-24 relative'>
          <Image
            src='https://picsum.photos/id/1005/200/300'
            alt='Profile'
            sizes='100%'
            fill
            className='rounded-full object-cover'
          />
        </CardHeader>
        <CardTitle className='font-medium text-xl mt-4'>{name}</CardTitle>
        <CardDescription className='mt-2'>{timestamp}</CardDescription>
        <CardFooter
          className={`${
            status === UserLogStatus.ON_TIME
              ? 'text-green-600 bg-green-100'
              : status === UserLogStatus.LATE
              ? 'text-yellow-600 bg-yellow-100'
              : 'bg-gray-100'
          } mt-2 px-2 py-1 rounded-xl text-sm`}
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
