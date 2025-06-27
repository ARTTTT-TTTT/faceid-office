import { useFetch } from '@/hooks/use-fetch';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { countPeople } from '@/utils/api/person';

import { DetectionPersonResponse } from '@/types/detection-log';

interface Props {
  person: DetectionPersonResponse[] | null;
}

export default function DetectionSummary({ person }: Props) {
  const { data: countPeopleData } = useFetch<number>(countPeople);

  const detectedCount = person?.length ?? 0;
  const totalCount = countPeopleData ?? 0;
  const percentage =
    totalCount > 0 ? Math.round((detectedCount / totalCount) * 100) : 0;

  return (
    <section className='flex size-full items-center justify-between gap-6 pt-6'>
      <Card className='grid size-full grid-cols-2 grid-rows-2 gap-2'>
        <CardHeader className='pr-0'>
          <CardTitle>คนที่ตรวจสอบได้</CardTitle>
          <CardDescription className='sr-only'>Person count</CardDescription>
        </CardHeader>
        <CardContent className='col-start-1 row-start-2 pb-0'>
          {detectedCount}
        </CardContent>
        <div className='col-start-2 row-span-2 row-start-1 flex items-center justify-center'>
          <PercentageCircle percentage={percentage} />
        </div>
      </Card>

      <Card className='grid size-full grid-rows-2 gap-2'>
        <CardHeader>
          <CardTitle>คนที่ไม่สามารถระบุตัวตนได้</CardTitle>
          <CardDescription className='sr-only'>Unknown count</CardDescription>
        </CardHeader>
        <CardContent className='pb-0'>{totalCount - detectedCount}</CardContent>
      </Card>
    </section>
  );
}

const PercentageCircle = ({ percentage = 0, size = 80, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className='relative flex size-full items-center justify-center'
      style={{ width: size, height: size }}
    >
      <svg className='-rotate-90 transform' width={size} height={size}>
        <circle
          className='text-gray-200 dark:text-gray-700'
          stroke='currentColor'
          strokeWidth={strokeWidth}
          fill='transparent'
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className='text-blue-500'
          stroke='currentColor'
          strokeWidth={strokeWidth}
          strokeLinecap='round'
          fill='transparent'
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
      </svg>
      <span className='absolute text-sm font-bold text-gray-700 dark:text-gray-300'>
        {`${Math.round(percentage)}%`}
      </span>
    </div>
  );
};
