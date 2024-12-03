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
import { StudentService } from './student.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateStudentDTO,
  UpdateStudentDTO,
} from '../user/dto/create-student.dto';
import { queryPick } from 'src/utils/queryPick';
import { paginationOptions } from 'src/constants/paginationOptions';
import { studentFilterAbleField } from './student.constant';
import { apiResponse } from 'src/utils/api-response';

@ApiTags('Student')
@Controller('/student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @ApiOkResponse({ type: [CreateStudentDTO] })
  @ApiOperation({ description: 'get all students endpoints' })
  async getAllStudent(@Query() query: Record<string, any>) {
    const paginationsFields = queryPick(query, paginationOptions);
    const searchOptions = queryPick(query, studentFilterAbleField);

    const result = await this.studentService.getAllStudent(
      searchOptions,
      paginationsFields,
    );

    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result.data,
      meta: result.meta,
      message: 'all students retrieve successfully',
    });
    return response;
  }

  @Get('/:id')
  @ApiOkResponse({ type: [CreateStudentDTO] })
  @ApiOperation({ description: 'get student endpoints' })
  async getStudent(@Param('id') id: string) {
    const result = await this.studentService.getStudent(id);

    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result,
      message: ' student retrieve successfully',
    });
    return response;
  }

  @Patch('/:id')
  @ApiOkResponse({ type: [CreateStudentDTO] })
  @ApiOperation({ description: 'update student endpoints' })
  async updateStudent(@Param('id') id: string, @Body() data: UpdateStudentDTO) {
    const result = await this.studentService.updateStudent(id, data);

    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result,
      message: ' student updated successfully',
    });
    return response;
  }

  @Delete('/:id')
  @ApiOkResponse({ type: [CreateStudentDTO] })
  @ApiOperation({ description: 'delete student endpoints' })
  async deleteStudent(@Param('id') id: string) {
    const result = await this.studentService.deleteStudent(id);
    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result,
      message: ' student deleted successfully',
    });
    return response;
  }
}
