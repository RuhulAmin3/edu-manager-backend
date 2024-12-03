import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TeacherControler } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [TeacherControler],
  providers: [TeacherService],
})
export class TeacherModule {}
