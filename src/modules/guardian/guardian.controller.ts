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
import { GuardianService } from './guardian.service';
import { guardianFilterAbleField } from './guardian.constant';
import {
  CreateGuardianDTO,
  UpdateGuardianDTO,
} from '../user/dto/create-guardian.dto';

@ApiTags('Guardian')
@Controller('/guardian')
export class GuadianController {
  constructor(private readonly guradianService: GuardianService) {}

  @Get()
  @ApiOkResponse({ type: [CreateGuardianDTO] })
  @ApiOperation({ description: 'get all guardian endpoints' })
  async getAllGuardian(@Query() query: Record<string, any>) {
    const paginationsFields = queryPick(query, paginationOptions);
    const searchOptions = queryPick(query, guardianFilterAbleField);

    const result = await this.guradianService.getAllGuardian(
      searchOptions,
      paginationsFields,
    );

    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result.data,
      meta: result.meta,
      message: 'all guradian retrieve successfully',
    });
    return response;
  }

  @Get('/:id')
  @ApiOkResponse({ type: [UpdateGuardianDTO] })
  @ApiOperation({ description: 'get guardian endpoints' })
  async getGuardian(@Param('id') id: string) {
    const result = await this.guradianService.getGuardian(id);

    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result,
      message: ' guardian retrieve successfully',
    });
    return response;
  }

  @Patch('/:id')
  @ApiOkResponse({ type: [UpdateGuardianDTO] })
  @ApiOperation({ description: 'update guardian endpoints' })
  async updateGuardian(
    @Param('id') id: string,
    @Body() data: UpdateGuardianDTO,
  ) {
    const result = await this.guradianService.updateGuardian(id, data as any);

    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result,
      message: ' guardian updated successfully',
    });
    return response;
  }

  @Delete('/:id')
  @ApiOkResponse()
  @ApiOperation({ description: 'delete guardian endpoints' })
  async deleteGuardian(@Param('id') id: string) {
    const result = await this.guradianService.deleteGuardian(id);

    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result,
      message: ' guardian deleted successfully',
    });
    return response;
  }
}
