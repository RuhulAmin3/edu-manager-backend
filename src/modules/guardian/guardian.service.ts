import {
  PaginationMetaData,
  calculatePagination,
} from 'src/utils/calculatePagination';
import { PrismaService } from '../prisma/prisma.service';
import { Guardian, Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { guardianSearchAbleField } from './guardian.constant';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class GuardianService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getAllGuardian(searchOptions, paginationOptions) {
    const { page, limit, skip, sortBy, sortOrder } =
      calculatePagination(paginationOptions);

    const { searchTerm, ...filterOptions } = searchOptions;
    const conditions = [];

    if (searchTerm) {
      conditions.push({
        OR: guardianSearchAbleField.map((field) => {
          return {
            [field]: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          };
        }),
      });
    }

    if (filterOptions && Object.keys(filterOptions).length > 0) {
      conditions.push({
        AND: Object.entries(filterOptions).map(([field, value]) => {
          return {
            [field]: {
              equals: value,
            },
          };
        }),
      });
    }

    const finalCondition: Prisma.GuardianWhereInput =
      conditions.length > 0 ? { AND: conditions } : {};
    const result = await this.prisma.guardian.findMany({
      where: finalCondition,
      skip: skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalDoc = await this.prisma.guardian.count({
      where: finalCondition,
    });

    // const totalPages = Math.ceil(totalDoc / +limit);
    // const nextPage = page < totalPages ? page + 1 : null;
    // const prevPage = page > 1 ? page - 1 : null;
    const { totalPages, nextPage, prevPage } = PaginationMetaData(
      page,
      totalDoc,
      limit,
    );

    const meta = {
      limit: limit,
      totalDoc,
      page: page,
      totalPages,
      prevPage,
      nextPage,
    };
    return { data: result, meta };
  }

  async getGuardian(id: string) {
    const result = await this.prisma.guardian.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('guardian not found');
    }

    return result;
  }

  async updateGuardian(id: string, updateGuardianData: Partial<Guardian>) {
    const result = await this.prisma.guardian.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('guardian not found');
    }

    const updatedGuardian = await this.prisma.guardian.update({
      where: { id },
      data: updateGuardianData,
    });

    return updatedGuardian;
  }

  async deleteGuardian(id: string) {
    const result = await this.prisma.guardian.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('guardian not found');
    }

    if (result.imagePublicId) {
      await this.cloudinaryService.deleteImageFromCloud(result.imagePublicId);
    }
    await this.prisma.$transaction(async (tsx) => {
      // delete from guardian collection
      await tsx.guardian.delete({
        where: {
          id,
        },
      });

      // delete from user collection
      await tsx.user.delete({
        where: {
          guardianId: result.guardianId,
        },
      });
    });
  }
}
