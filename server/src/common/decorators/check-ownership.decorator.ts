import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { OwnershipGuard } from '@/common/guards/ownership.guard';
import { SourceType } from '@/common/types/source.type';

export function CheckOwnership(
  resource: string,
  idKey = 'id',
  source: SourceType = 'params',
) {
  return applyDecorators(
    SetMetadata('resource', resource),
    SetMetadata('idKey', idKey),
    SetMetadata('source', source),
    UseGuards(JwtAuthGuard, OwnershipGuard),
  );
}
