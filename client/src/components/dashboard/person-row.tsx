import { TableCell, TableRow } from '@/components/ui/table';

import { Person } from '@/types/person';

interface Props {
  person: Person;
}

export const PersonRow: React.FC<Props> = ({ person }) => {
  return (
    <TableRow className='transition-colors hover:bg-blue-200'>
      <TableCell className='break-word whitespace-pre-wrap pl-5 align-top font-medium'>
        {person.fullName}
      </TableCell>
      <TableCell className='text-nowrap text-center align-top'>
        {person.position}
      </TableCell>
    </TableRow>
  );
};
