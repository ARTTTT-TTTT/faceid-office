import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { OwnershipGuard } from '../guards/ownership.guard';
import { SourceType } from '../types/source.type';

export function CheckOwnership(
  resource: string,
  idKey = 'id',
  source: SourceType = 'params',
) {
  return applyDecorators(
    SetMetadata('resource', resource),
    SetMetadata('idKey', idKey),
    SetMetadata('source', source),
    UseGuards(OwnershipGuard),
  );
}
