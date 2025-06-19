import { Dispatch, SetStateAction } from 'react';

import { cn } from '@/lib/utils';

import { PersonRow } from '@/components/dashboard/person-row';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Person } from '@/types/person';

interface Props {
  handleSort: (key: keyof Person) => void;
  getSortIcon: (key: keyof Person) => JSX.Element | null;
  currentItems: Person[];
}

export const PersonTable: React.FC<Props> = ({
  handleSort,
  getSortIcon,
  currentItems,
}) => {
  return (
    <Table>
      <TableHeader className='cursor-pointer bg-blue-400 hover:bg-blue-400'>
        <TableRow className='bg-blue-400 hover:bg-blue-400'>
          {[
            { key: 'fullName', label: 'ชื่อ', className: 'ml-3' },
            {
              key: 'position',
              label: 'ตำแหน่ง',
              className: 'justify-center',
            },
          ].map(({ key, label, className }) => (
            <TableHead
              key={key}
              className='text-nowrap hover:bg-blue-400'
              onClick={() => handleSort(key as keyof Person)}
            >
              <span
                className={`flex items-center gap-1 font-semibold text-white ${className}`}
              >
                {label}
                {getSortIcon(key as keyof Person)}
              </span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {currentItems.length > 0 ? (
          currentItems.map((person: Person) => (
            <PersonRow key={person.id} person={person} />
          ))
        ) : (
          <TableRow className='hover:bg-blue-200'>
            <TableCell colSpan={2} className='py-4 text-center text-gray-500'>
              ไม่มีข้อมูลสมาชิก
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      <TableFooter className={cn(currentItems.length > 0 ? '' : 'hidden')}>
        <TableRow className='bg-gray-50'>
          <TableCell
            className='pl-5 font-semibold text-gray-700 dark:text-gray-200'
            colSpan={1}
          >
            จำนวนสมาชิก
          </TableCell>
          <TableCell className='text-center font-semibold text-gray-700 dark:text-gray-200'>
            {currentItems.length}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

type PersonTableFooterProps = {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setItemsPerPage: Dispatch<SetStateAction<number>>;
  setCurrentPage: Dispatch<SetStateAction<number>>;
};

export const PersonTableFooter: React.FC<PersonTableFooterProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  setCurrentPage,
}) => {
  return (
    <footer className='flex w-full items-center justify-between gap-4 border-t border-gray-200 p-4'>
      <section className='flex items-center gap-2'>
        <span className='text-sm text-gray-600 dark:text-gray-300'>แสดง</span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value: string) => {
            setItemsPerPage(Number(value));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className='w-20'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='5'>5</SelectItem>
            <SelectItem value='10'>10</SelectItem>
            <SelectItem value='25'>25</SelectItem>
            <SelectItem value='50'>50</SelectItem>
          </SelectContent>
        </Select>
        <span className='text-sm text-gray-600 dark:text-gray-300'>
          รายการต่อหน้า
        </span>
      </section>
      <section className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          ก่อนหน้า
        </Button>
        <span className='text-sm text-gray-600 dark:text-gray-300'>
          หน้า {currentPage} จาก {totalPages}
        </span>
        <Button
          variant='outline'
          size='sm'
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          ถัดไป
        </Button>
      </section>
    </footer>
  );
};
