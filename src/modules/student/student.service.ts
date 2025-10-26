import { calculatePagination } from 'src/utils/calculatePagination';
import { PrismaService } from '../prisma/prisma.service';
import { studentSearchAbleField } from './student.constant';
import { Prisma, Student } from '@prisma/client';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class StudentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
    const existingStudent = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      throw new NotFoundException('Student not found');
    }

    // Merge nested objects safely
    const updatedName = { ...existingStudent.name, ...updatedStudentData.name };
    const updatedGuardian = {
      ...existingStudent.guardian,
      ...updatedStudentData.guardian,
    };

    const updatedStudentPayload = {
      ...updatedStudentData,
      name: updatedName,
      guardian: updatedGuardian,
    };

    // ✅ If class is unchanged — simple update
    if (
      !updatedStudentData.className ||
      existingStudent.className === updatedStudentData.className
    ) {
      return await this.prisma.student.update({
        where: { id },
        data: updatedStudentPayload,
      });
    }

    // ✅ Validate class and studentId before transaction
    if (!updatedStudentData.studentId) {
      throw new BadRequestException('Student ID is required for class change');
    }

    const newClass = await this.prisma.class.findUnique({
      where: { className: updatedStudentData.className },
      select: { studentIds: true },
    });

    if (!newClass) {
      throw new BadRequestException('New class does not exist');
    }

    const previousClass = await this.prisma.class.findUnique({
      where: { className: existingStudent.className },
      select: { studentIds: true },
    });

    if (!previousClass) {
      throw new NotFoundException('Previous class not found');
    }

    // ✅ Transaction
    const updatedStudent = await this.prisma.$transaction(async (trx) => {
      const prevIds = previousClass.studentIds ?? [];
      const newIds = newClass.studentIds ?? [];

      // 1. Remove student from previous class
      await trx.class.update({
        where: { className: existingStudent.className },
        data: {
          studentIds: {
            set: prevIds.filter((sid) => sid !== updatedStudentData.studentId),
          },
        },
      });

      // 2. Add student to new class (only if not already exists)
      const updatedNewIds = newIds.includes(updatedStudentData.studentId)
        ? newIds
        : [...newIds, updatedStudentData.studentId];

      await trx.class.update({
        where: { className: updatedStudentData.className },
        data: {
          studentIds: {
            set: updatedNewIds,
          },
        },
      });

      // 3. Update student info
      const student = await trx.student.update({
        where: { id },
        data: updatedStudentPayload,
      });

      return student;
    });

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
    if (result.imagePublicId) {
      await this.cloudinaryService.deleteImageFromCloud(result.imagePublicId);
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
