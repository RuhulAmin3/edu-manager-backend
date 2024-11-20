import { excludeField } from './../../utils/excludeField';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { calculatePagination } from 'src/utils/calculatePagination';
import { CreateClassDTO } from './dto/create-class.dto';

@Injectable()
export class ClassService {
  constructor(private readonly prisma: PrismaService) {}

  async addNewClass(data: CreateClassDTO) {
    const isExist = await this.prisma.class.findFirst({
      where: {
        className: {
          equals: data.className,
          mode: 'insensitive',
        },
      },
    });

    if (isExist) {
      throw new ConflictException('class already exist');
    }
    const { subjectIds } = data;

    // check all subject are available or not with the subjectIds
    const foundSubjects = await Promise.all(
      subjectIds.map((id) => this.prisma.subject.findUnique({ where: { id } })),
    );

    // Filter out null results to detect any missing subjects
    const validSubjects = foundSubjects.filter((subject) => subject !== null);

    if (validSubjects.length !== subjectIds.length) {
      throw new NotFoundException(
        'Some subjects not found with these subjectIds',
      );
    }

    const result = await this.prisma.class.create({
      data,
    });

    // populate subjects with subjectIds by query
    const subjects = await Promise.all(
      result.subjectIds.map(async (id) => {
        return await this.prisma.subject.findUnique({
          where: { id },
          select: { id: true, title: true },
        });
      }),
    );

    result['subjects'] = subjects;

    const withoutSubjectIdsField = excludeField(result, ['subjectIds']);

    return withoutSubjectIdsField;
  }

  async getClass(id: string) {
    const result = await this.prisma.class.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('class not found');
    }

    const subjects = await Promise.all(
      result.subjectIds.map(async (id) => {
        return await this.prisma.subject.findUnique({
          where: { id },
          select: { id: true, title: true },
        });
      }),
    );

    result['subjects'] = subjects;

    const withoutSubjectIdsField = excludeField(result, ['subjectIds']);

    return withoutSubjectIdsField;
  }

  async getAllClasses(searchOptions, paginationOptions) {
    const { page, limit, sortBy, sortOrder, skip } =
      calculatePagination(paginationOptions);

    const { searchTerm, ...filterOptions } = searchOptions;
    const conditions = [];

    if (searchTerm) {
      conditions.push({
        OR: ['className'].map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        })),
      });
    }

    if (Object.keys(filterOptions).length > 0) {
      conditions.push({
        AND: Object.entries(filterOptions).map(([field, value]) => ({
          [field]: value,
        })),
      });
    }

    const finalCondition: Prisma.ClassWhereInput =
      conditions.length > 0 ? { AND: conditions } : {};

    let allClasses = await this.prisma.class.findMany({
      where: finalCondition,
      skip: skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // populate the subjects by subjectIds
    if (allClasses.length) {
      allClasses = await Promise.all(
        allClasses.map(async (singleClass) => {
          const subjects = await Promise.all(
            singleClass.subjectIds.map(
              async (id) =>
                await this.prisma.subject.findUnique({
                  where: { id },
                  select: { id: true, title: true },
                }),
            ),
          );
          singleClass['subjects'] = subjects;
          const classWithoutSubjectIds = excludeField(singleClass, [
            'subjectIds',
          ]);
          return classWithoutSubjectIds;
        }),
      );
    }

    const totalDoc = await this.prisma.class.count({
      where: finalCondition,
    });

    const totalPages = Math.ceil(totalDoc / limit);
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
    return { data: allClasses, meta };
  }

  async updateClass(id: string, updatedData) {
    const result = await this.prisma.class.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('class not found');
    }

    if (updatedData.className) {
      const isClassAlreadyExist = await this.prisma.class.findUnique({
        where: {
          className: updatedData.className,
        },
      });
      if (isClassAlreadyExist) {
        throw new BadRequestException('class already exist');
      }
    }

    const updatedClass = await this.prisma.$transaction(async (tsx) => {
      // update class
      const updateClassData = await tsx.class.update({
        where: {
          id,
        },
        data: updatedData,
      });

      // update all the student of the class
      await tsx.student.updateMany({
        where: {
          className: result.className,
        },
        data: {
          className: updateClassData.className,
        },
      });

      return updateClassData;
      //have to update student exam result and transaction history //
      //after completing both module //
    });

    // populate all the subject details by subjectids;
    const subjects = await Promise.all(
      updatedClass.subjectIds.map(
        async (id) =>
          await this.prisma.subject.findUnique({
            where: { id },
            select: { id: true, title: true },
          }),
      ),
    );

    updatedClass['subjects'] = subjects;

    return updatedClass;
  }

  async deleteClass(id: string) {
    const result = await this.prisma.class.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('class not found');
    }

    if (result.studentIds.length > 0) {
      throw new BadRequestException(
        'you have to delete all the student of this class first to delete the perticular class',
      );
    }
    await this.prisma.class.delete({
      where: { id },
    });
    // all the exam also be delete (after completing exam module)
  }
}
