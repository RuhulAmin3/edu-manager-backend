import {
  BadRequestException,
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
    // Validate input data
    if (!id || !updatedData || Object.keys(updatedData).length === 0) {
      throw new BadRequestException('Invalid or empty update data provided');
    }

    // Check if subject exists
    const existingSubject = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      throw new NotFoundException('Subject not found');
    }

    // Check for code uniqueness if code is being updated
    if (updatedData.code && updatedData.code !== existingSubject.code) {
      const subjectWithSameCode = await this.prisma.subject.findFirst({
        where: {
          code: updatedData.code as number,
          id: { not: id }, // Exclude current subject
        },
      });

      if (subjectWithSameCode) {
        throw new ConflictException(
          `Subject code '${updatedData.code}' is already in use`,
        );
      }
    }

    // Check for title uniqueness if title is being updated
    if (
      updatedData.title &&
      updatedData.title.toString().toLowerCase() !==
        existingSubject.title.toString().toLowerCase()
    ) {
      const subjectWithSameTitle = await this.prisma.subject.findFirst({
        where: {
          title: updatedData.title as string,
          id: { not: id }, // Exclude current subject
        },
      });

      if (subjectWithSameTitle) {
        throw new ConflictException(
          `Subject title '${updatedData.title}' is already in use`,
        );
      }
    }
    // Update the subject
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
