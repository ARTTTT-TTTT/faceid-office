'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { AddPersonDialog } from '@/components/person/add-person-dialog';
import { PersonFilter } from '@/components/person/person-filter';
import {
  PersonTable,
  PersonTableFooter,
} from '@/components/person/person-table';
import { Button } from '@/components/ui/button';

import { itemVariants } from '@/app/settings/page';

import { Person } from '@/types/person';

export default function TeacherPage() {
  const router = useRouter();
  const [sortedData, setSortedData] = useState<Person[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Person;
    direction: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAddPersonDialogOpen, setIsAddPersonDialogOpen] = useState(false);
  const deferredSearch = useDeferredValue(searchTerm);

  // * PAGINATION
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const peopleData = useMemo<Person[]>(
    () => [
      { id: 1, fullName: 'อาท', position: 'TEACHER' as unknown as Person['position'] },
      { id: 2, fullName: 'พี', position: 'TEACHER' as unknown as Person['position'] },
      { id: 3, fullName: 'ปัน', position: 'TEACHER' as unknown as Person['position'] },
      { id: 4, fullName: 'ปัน', position: 'TEACHER' as unknown as Person['position'] },
    ],
    [],
  );

  const filteredData = useMemo(() => {
    if (!peopleData) return [];

    let data = [...peopleData];

    if (deferredSearch) {
      data = data.filter((person) =>
        Object.values(person).some(
          (value) =>
            value !== null &&
            value !== undefined &&
            value
              .toString()
              .toLowerCase()
              .includes(deferredSearch.toLowerCase()),
        ),
      );
    }
    return data;
  }, [peopleData, deferredSearch]);

  const sortData = useCallback(
    (
      data: Person[],
      config: {
        key: keyof Person;
        direction: string;
      } | null,
    ): Person[] => {
      if (!config) return data;

      return [...data].sort((a, b) => {
        const direction = config.direction;

        const aValue = a[config.key];
        const bValue = b[config.key];

        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          return direction === 'ascending'
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    },
    [],
  );

  const getSortIcon = (key: keyof Person) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? (
      <ChevronUp className='ml-1 inline-block h-4 w-4' />
    ) : (
      <ChevronDown className='ml-1 inline-block h-4 w-4' />
    );
  };

  const handleSort = (key: keyof Person) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    const config = { key, direction };
    const sortedArray = sortData(sortedData, config);

    setSortedData(sortedArray);
    setSortConfig(config);
  };

  useEffect(() => {
    const sortedFilteredData = sortData(filteredData, sortConfig);
    setSortedData(sortedFilteredData);
    setCurrentPage(1);
  }, [filteredData, sortConfig, sortData]);

  return (
    <main className='relative flex min-h-screen w-screen flex-col items-center justify-start py-6'>
      <section className='flex size-full max-w-xl flex-col items-center justify-start gap-6'>
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className='w-full'
        >
          <PersonFilter
            searchTerm={deferredSearch}
            setSearchTerm={setSearchTerm}
          />
        </motion.div>

        <motion.article
          variants={itemVariants}
          initial='hidden'
          animate='visible'
          custom={0.2}
          className='flex size-full flex-col overflow-hidden rounded-xl border border-gray-200 shadow-lg'
        >
          <section className='flex items-center justify-between bg-blue-400 p-4'>
            <span className='flex items-center justify-center gap-2 text-xl font-bold text-white'>
              <Users className='size-6' />
              สมาชิกทั้งหมด
            </span>

            {/* ADD PERSON */}
            <Button
              onClick={() => setIsAddPersonDialogOpen(true)}
              className='w-40 gap-2 bg-green-500 font-bold hover:bg-green-500'
            >
              <Plus className='size-10 font-bold' />
              เพิ่มสมาชิก
            </Button>
            <AddPersonDialog
              isOpen={isAddPersonDialogOpen}
              onClose={() => setIsAddPersonDialogOpen(false)}
            />
          </section>

          <PersonTable
            handleSort={handleSort}
            getSortIcon={getSortIcon}
            currentItems={currentItems}
          />

          {sortedData.length > 0 && (
            <PersonTableFooter
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              setCurrentPage={setCurrentPage}
            />
          )}
        </motion.article>
      </section>

      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.4,
        }}
        className='absolute left-6 top-6 z-20'
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          animate={{
            x: [0, -10, 0],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          className='rounded-full bg-blue-500 p-3 text-white shadow-lg'
          onClick={() => router.back()}
        >
          <ArrowLeft className='size-6' />
        </motion.button>
      </motion.div>
    </main>
  );
}
