import { TableCell, TableRow } from '@/components/ui/table';

import { Person } from '@/types/person';

interface Props {
  person: Person;
}

export const PersonRow: React.FC<Props> = ({ person }) => {
  return (
    <TableRow className='transition-colors hover:bg-blue-200'>
      <TableCell className='break-word whitespace-pre-wrap align-top font-medium'>
        {person.fullName}ชื่อ
      </TableCell>
      <TableCell className='text-nowrap text-center align-top'>
        {person.position}ตำแหน่ง
      </TableCell>
    </TableRow>
  );
};
