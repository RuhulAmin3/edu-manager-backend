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
  Req,
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDTO, UpdateSubjectDTO } from './dto/create-subject.dto';
import { apiResponse } from 'src/utils/api-response';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { queryPick } from 'src/utils/queryPick';
import { paginationOptions } from 'src/constants/paginationOptions';
import { queryOptions } from './subject.constant';
import { HasRoles } from '../auth/decorator/roles.decorator';
import { ROLE } from '@prisma/client';
import { Request } from 'express';

@Controller('/subject')
@ApiTags('Subject')
@HasRoles(ROLE.ADMIN)
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  @ApiCreatedResponse({ type: CreateSubjectDTO })
  @ApiOperation({ description: 'add subject endpoints' })
  async addSubject(@Body() subjectData: CreateSubjectDTO) {
    const result = await this.subjectService.addSubject(subjectData);
    const response = apiResponse({
      statusCode: HttpStatus.CREATED,
      data: result,
      message: 'subject added successfully',
    });
    return response;
  }

  @Get()
  @ApiOkResponse({ type: [CreateSubjectDTO] })
  @ApiOperation({ description: 'get all subject endpoints' })
  async getSubjects(@Req() req: Request, @Query() query: Record<string, any>) {
    const paginationsFields = queryPick(query, paginationOptions);
    const searchOptions = queryPick(query, queryOptions);
    console.log('refreshToken', JSON.stringify(req.cookies['refreshToken']));
    const result = await this.subjectService.getAllSubject(
      searchOptions,
      paginationsFields,
    );

    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result.data,
      meta: result.meta,
      message: 'all subjects retrieve successfully',
    });
    return response;
  }

  @Get('/:id')
  @ApiOkResponse({ type: CreateSubjectDTO })
  @ApiOperation({ description: 'single subject get endpoints' })
  async getSubject(@Param('id') id: string) {
    const result = await this.subjectService.getSubject(id);

    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result,
      message: 'subject retrieved successfully',
    });
    return response;
  }

  @Patch('/:id')
  @ApiOkResponse({ type: CreateSubjectDTO })
  @ApiOperation({ description: 'subject update endpoints' })
  async updateSubject(@Param('id') id: string, @Body() data: UpdateSubjectDTO) {
    const result = await this.subjectService.updateSubject(id, data);
    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result,
      message: 'subject update successfully',
    });
    return response;
  }

  @Delete('/:id')
  @ApiOkResponse()
  @ApiOperation({ description: 'subject delete endpoints' })
  async deleteSubject(@Param('id') id: string) {
    await this.subjectService.deleteSubject(id);
    const response = apiResponse({
      statusCode: HttpStatus.OK,
      message: 'subject deleted successfully',
    });
    return response;
  }
}
