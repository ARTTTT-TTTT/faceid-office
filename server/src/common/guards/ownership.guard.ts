import { PrismaService } from '@/prisma/prisma.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthRequest } from '../interfaces/auth-request.interface';
import { ResourceType } from '../interfaces/resource-owner.interface';
import { SourceType } from '../types/source.type';

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

    const resourceType = this.reflector.get<string>(
      'resource',
      context.getHandler(),
    );
    const idKey =
      this.reflector.get<string>('idKey', context.getHandler()) || 'id';
    const source: SourceType =
      this.reflector.get<SourceType>('source', context.getHandler()) ||
      'params';

    let idValue: string | number | boolean | object | undefined;

    if (source === 'params') {
      idValue = request.params[idKey];
    } else if (source === 'body') {
      idValue = request.body[idKey];
    } else if (source === 'query') {
      idValue = request.query[idKey];
    }

    if (!resourceType || !idValue) {
      throw new ForbiddenException(
        'Invalid ownership check configuration: Missing resource type or ID key metadata.',
      );
    }

    const resourceId = idValue as string; // Assuming ID is a string for Prisma

    let resource: ResourceType;

    let isOwner = false; // Flag to track ownership

    switch (resourceType) {
      case 'camera':
        resource = await this.prisma.camera.findFirst({
          where: { id: resourceId },
        });
        if (resource?.adminId === adminId) {
          isOwner = true;
        }
        break;
      case 'person':
        resource = await this.prisma.person.findFirst({
          where: { id: resourceId },
        });
        if (resource?.adminId === adminId) {
          isOwner = true;
        }
        break;
      case 'session':
        resource = await this.prisma.detectionSession.findFirst({
          where: { id: resourceId },
          include: { camera: true },
        });
        if (resource?.camera?.adminId === adminId) {
          isOwner = true;
        }
        break;
      case 'log':
        resource = await this.prisma.detectionLog.findFirst({
          where: { id: resourceId },
          include: { camera: true },
        });
        if (resource?.camera?.adminId === adminId) {
          isOwner = true;
        }
        break;
      default:
        throw new ForbiddenException(
          `Unsupported resource type: ${resourceType}`,
        );
    }

    if (!resource) {
      throw new NotFoundException(`${resourceType} not found`);
    }

    if (!isOwner) {
      throw new ForbiddenException(
        `Unauthorized to access this ${resourceType}`,
      );
    }

    return true;
  }
}
