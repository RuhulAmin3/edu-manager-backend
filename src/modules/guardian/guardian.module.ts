import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GuardianService } from './guardian.service';
import { GuadianController } from './guardian.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [GuadianController],
  providers: [GuardianService],
})
export class GuardianModule {}
