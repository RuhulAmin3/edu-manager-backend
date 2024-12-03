import {
  PaginationMetaData,
  calculatePagination,
} from 'src/utils/calculatePagination';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Teacher } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { teacherSearchAbleField } from './teacher.constant';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class TeacherService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getAllTeacher(searchOptions, paginationOptions) {
    const { page, limit, skip, sortBy, sortOrder } =
      calculatePagination(paginationOptions);

    const { searchTerm, ...filterOptions } = searchOptions;
    const conditions = [];

    if (searchTerm) {
      conditions.push({
        OR: teacherSearchAbleField.map((field) => {
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
          if (field === 'salary') {
            return {
              [field]: {
                equals: +value,
              },
            };
          }
          return {
            [field]: {
              equals: value,
            },
          };
        }),
      });
    }

    const finalCondition: Prisma.TeacherWhereInput =
      conditions.length > 0 ? { AND: conditions } : {};
    const result = await this.prisma.teacher.findMany({
      where: finalCondition,
      skip: skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalDoc = await this.prisma.teacher.count({
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

  async getTeacher(id: string) {
    const result = await this.prisma.teacher.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('teacher not found');
    }

    return result;
  }

  async updateTeacher(id: string, updateTeacherData: Partial<Teacher>) {
    const result = await this.prisma.teacher.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('student not found');
    }

    const updatedStudent = await this.prisma.teacher.update({
      where: { id },
      data: updateTeacherData,
    });

    return updatedStudent;
  }

  async deleteTeacher(id: string) {
    const result = await this.prisma.teacher.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('teacher not found');
    }

    if (result.imagePublicId) {
      await this.cloudinaryService.deleteImageFromCloud(result.imagePublicId);
    }
    await this.prisma.$transaction(async (tsx) => {
      // delete from teacher collection
      await tsx.teacher.delete({
        where: {
          id,
        },
      });

      // delete from user collection
      await tsx.user.delete({
        where: {
          teacherId: result.teacherId,
        },
      });
    });
  }
}
