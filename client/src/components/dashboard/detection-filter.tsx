import { Search } from 'lucide-react';
import React from 'react';
import { DateRange } from 'react-day-picker';

import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Input } from '@/components/ui/input';

interface Props {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange | undefined) => void;
}

export const DetectionFilter: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
}) => {
  return (
    <section className='flex w-full items-center gap-4 rounded-lg'>
      {/* SEARCH BAR */}
      <div className='relative flex-grow rounded-lg bg-white'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500' />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder='ค้นหาด้วยชื่อ...'
          className='w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500'
        />
      </div>

      <DateRangePicker date={dateRange} setDate={setDateRange} />
    </section>
  );
};
