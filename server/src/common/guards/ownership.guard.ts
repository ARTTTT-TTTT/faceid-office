import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { AuthRequest } from '@/common/interfaces/auth-request.interface';
import { SourceType } from '@/common/types/source.type';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;
    const adminId = user?.sub;
    //console.log('adminId', adminId);

    const resourceType = this.reflector.get<string>(
      'resource',
      context.getHandler(),
    );
    const idKey =
      this.reflector.get<string>('idKey', context.getHandler()) || 'id';
    const source: SourceType =
      this.reflector.get<SourceType>('source', context.getHandler()) ||
      'params';

    const idValue = this.extractIdFromRequest(request, source, idKey);

    if (!resourceType || typeof idValue !== 'string') {
      throw new ForbiddenException(
        'Invalid ownership check configuration: Missing or invalid resource type or ID.',
      );
    }

    const resourceId = idValue;
    const isOwner = await this.verifyOwnership(
      resourceType,
      resourceId,
      adminId,
    );

    if (!isOwner.found) {
      throw new NotFoundException(`${resourceType} not found`);
    }

    if (!isOwner.ok) {
      throw new ForbiddenException(
        `Unauthorized to access this ${resourceType}`,
      );
    }

    return true;
  }

  private extractIdFromRequest(
    request: Request,
    source: SourceType,
    idKey: string,
  ): string | undefined {
    //console.log('extractIdFromRequest', source, idKey);
    if (source === 'params') return request.params[idKey];
    if (source === 'body') {
      const value = (request.body as Record<string, unknown>)[idKey];
      return typeof value === 'string' ? value : undefined;
    }
    if (source === 'query') {
      const value = request.query[idKey];
      if (typeof value === 'string') return value;
      //console.log('value', value);
      if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
      return undefined;
    }
    return undefined;
  }

  private async verifyOwnership(
    resourceType: string,
    resourceId: string,
    adminId: string,
  ): Promise<{ ok: boolean; found: boolean }> {
    const isUUID = (value: string): boolean =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      );

    // ✅ Early return if resourceId is not a valid UUID
    if (!isUUID(resourceId)) {
      throw new BadRequestException(`${resourceType}Id must be UUID,`);
    }
    switch (resourceType) {
      case 'camera': {
        const camera = await this.prisma.camera.findFirst({
          where: { id: resourceId, adminId },
        });
        return { ok: !!camera, found: !!camera };
      }
      case 'person': {
        const person = await this.prisma.person.findFirst({
          where: { id: resourceId, adminId },
        });
        return { ok: !!person, found: !!person };
      }
      case 'session': {
        const session = await this.prisma.detectionSession.findFirst({
          where: { id: resourceId },
          include: { camera: true },
        });
        //console.log('session', session);
        //console.log('adminId', adminId);
        //console.log('session?.camera?.adminId', session?.camera?.adminId);
        return {
          ok: session?.camera?.adminId === adminId,
          found: !!session,
        };
      }
      case 'log': {
        const log = await this.prisma.detectionLog.findFirst({
          where: { id: resourceId },
          include: {
            session: {
              include: {
                camera: true,
              },
            },
          },
        });
        return {
          ok: log?.session?.camera?.adminId === adminId,
          found: !!log,
        };
      }
      default:
        throw new ForbiddenException(
          `Unsupported resource type: ${resourceType}`,
        );
    }
  }
}
