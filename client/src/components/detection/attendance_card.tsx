import Image from 'next/image';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AttendanceCardProps {
  name: string;
  image: string;
  timestamp: string;
  status: string;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  name,
  image,
  timestamp,
  status,
}: AttendanceCardProps) => {
  return (
    <Card>
      <CardContent className='p-4 flex flex-col items-center'>
        <CardHeader className='w-24 h-24 relative'>
          <Image
            src={image}
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
            status === 'on_time'
              ? 'text-green-600 bg-green-100'
              : status === 'late'
              ? 'text-yellow-600 bg-yellow-100'
              : 'bg-gray-100'
          } mt-2 px-2 py-1 rounded-xl text-sm`}
        >
          {status === 'on_time'
            ? 'เข้างาน'
            : status === 'late'
            ? 'สาย'
            : 'ไม่พบข้อมูล'}
        </CardFooter>
      </CardContent>
    </Card>
  );
};
