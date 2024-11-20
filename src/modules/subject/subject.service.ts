import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { calculatePagination } from 'src/utils/calculatePagination';

@Injectable()
export class SubjectService {
  constructor(private readonly prisma: PrismaService) {}

  async addSubject(data: Prisma.SubjectCreateInput) {
    const isExist = await this.prisma.subject.findUnique({
      where: {
        code: data.code,
      },
    });

    if (isExist) {
      throw new ConflictException('subject already exist');
    }

    const result = await this.prisma.subject.create({
      data,
    });

    return result;
  }

  async getSubject(id: string) {
    const result = await this.prisma.subject.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('subject not found');
    }

    return result;
  }

  async getAllSubject(searchOptions, paginationOptions) {
    const { page, limit, sortBy, sortOrder, skip } =
      calculatePagination(paginationOptions);

    const { searchTerm, ...filterOptions } = searchOptions;
    const conditions = [];

    if (searchTerm) {
      conditions.push({
        OR: ['title'].map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        })),
      });
    }
    if (Object.keys(filterOptions).length > 0) {
      conditions.push({
        AND: Object.entries(filterOptions).map(([field, value]) => {
          if (field == 'code') {
            return {
              [field]: +value,
            };
          }
          return {
            [field]: value,
          };
        }),
      });
    }

    const finalCondition: Prisma.SubjectWhereInput =
      conditions.length > 0 ? { AND: conditions } : {};

    const result = await this.prisma.subject.findMany({
      where: finalCondition,
      skip: skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalDoc = await this.prisma.subject.count({
      where: finalCondition,
    });

    const totalPages = Math.ceil(totalDoc / +limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;
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

  async updateSubject(id: string, updatedData: Prisma.SubjectUpdateInput) {
    const result = await this.prisma.subject.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('subject not found');
    }

    const isExist = await this.prisma.subject.findUnique({
      where: {
        code: updatedData.code as number,
      },
    });

    if (isExist?.id != id) {
      throw new ConflictException('subject code already exist');
    }

    const updatedSubject = await this.prisma.subject.update({
      where: { id },
      data: updatedData,
    });

    return updatedSubject;
  }

  async deleteSubject(id: string) {
    const result = await this.prisma.subject.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('subject not found');
    }
    await this.prisma.subject.delete({
      where: { id },
    });
  }
}
