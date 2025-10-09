import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { queryPick } from 'src/utils/queryPick';
import { paginationOptions } from 'src/constants/paginationOptions';
import { apiResponse } from 'src/utils/api-response';
import { TeacherService } from './teacher.service';
import {
  CreateTeacherDTO,
  UpdateTeacherDTO,
} from '../user/dto/create-teacher.dto';
import { teacherFilterAbleField } from './teacher.constant';

@ApiTags('Teacher')
@Controller('/teacher')
export class TeacherControler {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  @ApiOkResponse({ type: [CreateTeacherDTO] })
  @ApiOperation({ description: 'get all teachers endpoints' })
  async getAllTeacher(@Query() query: Record<string, any>) {
    const paginationsFields = queryPick(query, paginationOptions);
    const searchOptions = queryPick(query, teacherFilterAbleField);

    const result = await this.teacherService.getAllTeacher(
      searchOptions,
      paginationsFields,
    );

    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result.data,
      meta: result.meta,
      message: 'all teacher retrieve successfully',
    });
    return response;
  }

  @Get('/:id')
  @ApiOkResponse({ type: [CreateTeacherDTO] })
  @ApiOperation({ description: 'get teacher endpoints' })
  async getTeacher(@Param('id') id: string) {
    const result = await this.teacherService.getTeacher(id);

    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result,
      message: ' teacher retrieve successfully',
    });
    return response;
  }

  @Patch('/:id')
  @ApiOkResponse({ type: [CreateTeacherDTO] })
  @ApiOperation({ description: 'update teacher endpoints' })
  async updateTeacher(@Param('id') id: string, @Body() data: UpdateTeacherDTO) {
    const result = await this.teacherService.updateTeacher(id, data as any);

    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result,
      message: ' teacher updated successfully',
    });
    return response;
  }

  @Delete('/:id')
  @ApiOkResponse()
  @ApiOperation({ description: 'delete teacher endpoints' })
  async deleteTeacher(@Param('id') id: string) {
    const result = await this.teacherService.deleteTeacher(id);

    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result,
      message: ' teacher deleted successfully',
    });
    return response;
  }
}
