import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { OwnershipGuard } from '../guards/ownership.guard';

export function CheckOwnership(
  resource: string,
  idKey = 'id',
  source: 'params' | 'body' | 'query' = 'params',
) {
  return applyDecorators(
    SetMetadata('resource', resource),
    SetMetadata('idKey', idKey),
    SetMetadata('source', source),
    UseGuards(OwnershipGuard),
  );
}
