import { Search } from 'lucide-react';
import React, { useState } from 'react';

import logger from '@/lib/logger';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

type User = { id: string; name: string; position: string };

export const SignYourself: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [signedInUsers, setSignedInUsers] = useState(['สมหญิง']);

  const databaseUsers = [
    { id: '1', name: 'สมชาย', position: 'พนักงานขาย' },
    { id: '2', name: 'สมหญิง', position: 'ผู้จัดการ' },
    { id: '3', name: 'สมศรี', position: 'พนักงาน' },
    { id: '4', name: 'สมชาย', position: 'หัวหน้าทีม' },
    { id: '5', name: 'มานะ', position: 'พนักงาน' },
    { id: '6', name: 'มานี', position: 'พนักงาน' },
    { id: '7', name: 'ปิติ', position: 'พนักงาน' },
    { id: '8', name: 'ชูใจ', position: 'พนักงาน' },
    { id: '9', name: 'สุดา', position: 'พนักงาน' },
    { id: '10', name: 'วินัย', position: 'พนักงาน' },
    { id: '11', name: 'วีระ', position: 'พนักงาน' },
    { id: '12', name: 'จันทร', position: 'พนักงาน' },
    { id: '13', name: 'สมชาย', position: 'พนักงาน' },
    { id: '14', name: 'สมชาย', position: 'พนักงาน' },
    { id: '15', name: 'สมชาย', position: 'พนักงาน' },
    { id: '16', name: 'สมชาย', position: 'พนักงาน' },
  ];

  const handleSearch = () => {
    logger('Searching for:', searchTerm);

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    setHasSearched(true);

    if (!normalizedSearchTerm) {
      setSearchResults([]);
      return;
    }

    const foundUsers = databaseUsers.filter((user) =>
      user.name.toLowerCase().includes(normalizedSearchTerm),
    );

    setSearchResults(foundUsers);
    setSearchTerm('');
  };

  const handleSignIn = (userToSignIn: User) => {
    if (signedInUsers.includes(userToSignIn.name)) {
      alert(`คุณ ${userToSignIn.name} ได้ลงชื่อเข้าใช้แล้วในเซสชันนี้`);
      return;
    }

    setSignedInUsers((prevUsers) => [...prevUsers, userToSignIn.name]);
    alert(`คุณ ${userToSignIn.name} ได้รับการลงชื่อแล้ว!`);
    setSearchResults([]); // ล้างผลลัพธ์หลังจากลงชื่อเข้าใช้
    setHasSearched(false); // รีเซ็ตสถานะการค้นหา
  };

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='p-2'>
        <CardTitle>ลงชื่อด้วยตัวเอง</CardTitle>
        <CardDescription>
          หากไม่พบใบหน้ากรุณากรอกชื่อเพื่อระบุตัวตน
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-1 flex-col gap-2 overflow-hidden px-2 py-0'>
        {/* SEARCH */}
        <section className='flex items-start justify-start'>
          <Input
            type='text'
            placeholder='ชื่อ...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='mr-2 rounded-md border p-2'
          />
          <Button onClick={handleSearch}>
            <Search className='size-4 md:size-5' />{' '}
            <span className='font-medium'>ค้นหา</span>
          </Button>
        </section>

        {/* RESULT */}
        <section className='flex flex-1 flex-col overflow-hidden'>
          {hasSearched &&
            (searchResults.length > 0 ? (
              <>
                <p className='text-sm text-gray-500'>
                  พบหลายรายชื่อ. กรุณาเลือกเพื่อลงชื่อ:
                </p>
                <ScrollArea className='flex-1'>
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className='flex w-full items-center justify-between border-b p-2 last:border-b-0'
                    >
                      <span>
                        {user.name} ({user.position})
                      </span>
                      {signedInUsers.includes(user.name) ? (
                        <span className='font-medium text-orange-600'>
                          ลงชื่อแล้ว
                        </span>
                      ) : (
                        <Button onClick={() => handleSignIn(user)} size='sm'>
                          ลงชื่อ
                        </Button>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </>
            ) : (
              <p className='p-2 text-red-600'>ไม่พบรายชื่อในฐานข้อมูล</p>
            ))}
        </section>
      </CardContent>
    </Card>
  );
};
