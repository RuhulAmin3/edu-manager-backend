import { calculatePagination } from 'src/utils/calculatePagination';
import { PrismaService } from '../prisma/prisma.service';
import { studentSearchAbleField } from './student.constant';
import { Prisma, Student } from '@prisma/client';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllStudent(searchOptions, paginationOptions) {
    const { page, limit, skip, sortBy, sortOrder } =
      calculatePagination(paginationOptions);

    const { searchTerm, ...filterOptions } = searchOptions;
    const conditions = [];

    if (searchTerm) {
      conditions.push({
        OR: studentSearchAbleField.map((field) => {
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
          if (field === 'admissionYear') {
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

    const finalCondition: Prisma.StudentWhereInput =
      conditions.length > 0 ? { AND: conditions } : {};
    const result = await this.prisma.student.findMany({
      where: finalCondition,
      skip: skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalDoc = await this.prisma.student.count({
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

  async getStudent(id: string) {
    const result = await this.prisma.student.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('student not found');
    }

    return result;
  }

  async updateStudent(id: string, updatedStudentData: Partial<Student>) {
    const result = await this.prisma.student.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('student not found');
    }

    let updatedStudent;
    if (result.className == updatedStudentData.className) {
      updatedStudent = await this.prisma.student.update({
        where: { id },
        data: updatedStudentData,
      });
    } else {
      const isClassExist = await this.prisma.class.findUnique({
        where: { className: updatedStudentData.className },
      });
      if (!isClassExist) {
        throw new BadRequestException('update class does not added yet');
      }
      updatedStudent = await this.prisma.$transaction(async (tsx) => {
        const { studentIds } = await tsx.class.findUnique({
          where: { className: updatedStudentData.className },
        });

        await tsx.class.update({
          where: {
            className: updatedStudentData.className,
          },
          data: {
            studentIds: {
              set: [...studentIds, updatedStudentData.studentId],
            },
          },
        });

        const result = await tsx.student.update({
          where: {
            id,
          },
          data: updatedStudentData,
        });

        return result;
      });
    }

    return updatedStudent;
  }

  async deleteStudent(id: string) {
    const result = await this.prisma.student.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('student not found');
    }

    await this.prisma.$transaction(async (tsx) => {
      // delete from student collection
      await tsx.student.delete({
        where: {
          id,
        },
      });
      // delete from user collection
      await tsx.user.delete({
        where: {
          studentId: result.studentId,
        },
      });
      const { studentIds } = await tsx.class.findUnique({
        where: { className: result.className },
      });
      // remove from class collection
      await tsx.class.update({
        where: {
          className: result.className,
        },
        data: {
          studentIds: {
            set: studentIds.filter((id) => id != result.studentId),
          },
        },
      });
    });
  }
}
