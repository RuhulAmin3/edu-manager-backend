import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { apiResponse } from 'src/utils/api-response';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { queryPick } from 'src/utils/queryPick';
import { paginationOptions } from 'src/constants/paginationOptions';
import { CreateExamDTO, UpdateExamDTO } from './dto/create-exam.dto';
import { ExamService } from './exam.service';
import { queryOptions } from './exam.constant';
import { HasRoles } from '../auth/decorator/roles.decorator';
import { ROLE } from '@prisma/client';

@Controller('/exam')
@ApiTags('Exam')
@HasRoles(ROLE.ADMIN, ROLE.TEACHER)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  @ApiCreatedResponse({ type: CreateExamDTO })
  @ApiOperation({ description: 'add exam endpoints' })
  async addExam(@Body() examData: CreateExamDTO) {
    const result = await this.examService.createExam(examData);
    const response = apiResponse({
      statusCode: HttpStatus.CREATED,
      data: result,
      message: 'exam added successfully',
    });
    return response;
  }

  @Get()
  @ApiOkResponse({ type: [CreateExamDTO] })
  @ApiOperation({ description: 'get all exams endpoints' })
  async getExams(@Query() query: Record<string, any>) {
    const paginationsFields = queryPick(query, paginationOptions);
    const searchOptions = queryPick(query, queryOptions);
    const result = await this.examService.getAllExam(
      searchOptions,
      paginationsFields,
    );

    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result.data,
      meta: result.meta,
      message: 'all exams retrieve successfully',
    });
    return response;
  }

  @Get('/:id')
  @ApiOkResponse({ type: CreateExamDTO })
  @ApiOperation({ description: 'single exam get endpoints' })
  async getExam(@Param('id') id: string) {
    const result = await this.examService.getExam(id);

    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result,
      message: 'exam retrieved successfully',
    });
    return response;
  }

  @Patch('/:id')
  @HasRoles(ROLE.ADMIN)
  @ApiOkResponse({ type: CreateExamDTO })
  @ApiOperation({ description: 'Exam update endpoints' })
  async updateExam(@Param('id') id: string, @Body() data: UpdateExamDTO) {
    const result = await this.examService.updateExam(id, data);
    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result,
      message: 'exam update successfully',
    });
    return response;
  }

  @Delete('/:id')
  @HasRoles(ROLE.ADMIN)
  @ApiOkResponse()
  @ApiOperation({ description: 'Exam delete endpoints' })
  async deleteExam(@Param('id') id: string) {
    await this.examService.deleteExam(id);
    const response = apiResponse({
      statusCode: HttpStatus.OK,
      message: 'exam deleted successfully',
    });
    return response;
  }
}
