import { TableCell, TableRow } from '@/components/ui/table';

import { DetectionPersonResponse } from '@/types/detection-log';

interface Props {
  person: DetectionPersonResponse;
}

export const DetectionRow: React.FC<Props> = ({ person }) => {
  return (
    <TableRow className='transition-colors hover:bg-blue-200'>
      <TableCell className='break-word whitespace-pre-wrap pl-5 align-top font-medium'>
        {person.fullName}
      </TableCell>
      <TableCell className='text-nowrap text-center align-top'>
        {person.position}
      </TableCell>
      <TableCell className='text-nowrap text-center align-top'>
        {new Date(person.detectedAt).toLocaleString('th-TH')}
      </TableCell>
    </TableRow>
  );
};
