'use client';
import { motion, Variants } from 'framer-motion';
import { ChevronDown, ChevronUp, Loader2, Plus, Users, X } from 'lucide-react';
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useFetch } from '@/hooks/use-fetch';

import { AddPersonDialog } from '@/components/dashboard/add-person-dialog';
import { PersonFilter } from '@/components/dashboard/person-filter';
import {
  PersonTable,
  PersonTableFooter,
} from '@/components/dashboard/person-table';
import { Button } from '@/components/ui/button';

import { getPeople } from '@/utils/api/person';

import { Person } from '@/types/person';

const itemVariants: Variants = {
  hidden: { y: 40, opacity: 0 },
  visible: (custom: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 700,
      damping: 30,
      delay: custom,
    },
  }),
};

export default function DashboardPage() {
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

  const {
    data: peopleData,
    setData: setPeopleData,
    loading: peopleLoading,
  } = useFetch<Person[]>(getPeople);

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
    <main className='flex size-full flex-col items-center justify-start gap-6 rounded-b-xl bg-gray-100 px-4'>
      {/* Title */}
      <motion.h1
        // initial={{ y: -170 }}
        // animate={{ y: 0 }}
        // transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className='mt-2 text-4xl font-extrabold tracking-tight text-gray-800'
      >
        ตารางสมาชิก
      </motion.h1>

      {peopleLoading ? (
        <div className='flex size-fit items-center justify-center gap-2 rounded-md border p-4 text-muted-foreground'>
          <Loader2 className='size-6 animate-spin' />
          <span>กำลังโหลดข้อมูลสมาชิก...</span>
        </div>
      ) : peopleData ? (
        <>
          <motion.div
            variants={itemVariants}
            initial='hidden'
            animate='visible'
            custom={0.1}
            className='w-full max-w-2xl rounded-lg'
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
            className='flex h-fit w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-gray-200 shadow-lg'
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
                setPeopleData={setPeopleData}
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
        </>
      ) : (
        <div className='flex size-fit items-center justify-center gap-2 rounded-md border border-red-500 p-4 text-red-500'>
          <X className='size-6' />
          <span>ไม่พบข้อมูลสมาชิก โปรดติดต่อผู้พัฒนา...</span>
        </div>
      )}
    </main>
  );
}
