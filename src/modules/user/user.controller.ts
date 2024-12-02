import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CreateStudentDTO } from './dto/create-student.dto';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { JsonParseInterceptor } from 'src/common/interceptors/jsonParseInterceptor';
import { multerOptions } from 'src/common/multerOptions/multerOptions';
import { apiResponse } from 'src/utils/api-response';
import { CreateTeacherDTO } from './dto/create-teacher.dto';
import { CreateGuardianDTO } from './dto/create-guardian.dto';
import { Public } from '../auth/decorator/public.decorator';

@Controller('/user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/student')
  @UseInterceptors(
    FileInterceptor('image', multerOptions),
    new JsonParseInterceptor('student'),
  )
  async createStudent(
    @UploadedFile() image: Express.Multer.File,
    @Body('student') student: CreateStudentDTO,
    @Body('password') password: string,
  ) {
    const result = await this.userService.createStudent(
      student,
      image,
      password,
    );
    const responseObj = apiResponse<CreateStudentDTO>({
      statusCode: HttpStatus.CREATED,
      data: result,
      message: 'student created successfully',
    });
    return responseObj;
  }

  @Post('/teacher')
  @UseInterceptors(
    FileInterceptor('image', multerOptions),
    new JsonParseInterceptor('teacher'),
  )
  async createTeacher(
    @UploadedFile() image: Express.Multer.File,
    @Body('teacher') teacher: CreateTeacherDTO,
    @Body('password') password: string,
  ) {
    const result = await this.userService.createTeacher(
      teacher,
      image,
      password,
    );

    const responseObj = apiResponse<CreateTeacherDTO>({
      statusCode: HttpStatus.CREATED,
      data: result,
      message: 'teacher created successfully',
    });
    return responseObj;
  }

  @Post('/guardian')
  @Public()
  @UseInterceptors(
    FileInterceptor('image', multerOptions),
    new JsonParseInterceptor('guardian'),
  )
  async createGuardian(
    @UploadedFile() image: Express.Multer.File,
    @Body('guardian') guardian: CreateGuardianDTO,
  ) {
    const { password, ...restData } = guardian;
    const result = await this.userService.createGuardian(
      restData,
      image,
      password,
    );

    const responseObj = apiResponse<Omit<CreateGuardianDTO, 'password'>>({
      statusCode: HttpStatus.CREATED,
      data: result,
      message: 'guardian created successfully',
    });
    return responseObj;
  }
}
