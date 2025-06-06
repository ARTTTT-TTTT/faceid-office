import { Search } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

import { Input } from '@/components/ui/input';

type Props = {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
};

export const PersonFilter: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <section className='relative w-full max-w-xl items-center bg-white'>
      {/* SEARCH BAR */}
      <Search className='absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500' />
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder='ชื่อ...'
        className='rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500'
      />
    </section>
  );
};
