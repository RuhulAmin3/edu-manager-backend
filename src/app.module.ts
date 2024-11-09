import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { SubjectModule } from './modules/subject/subject.module';
import { ClassModule } from './modules/class/class.module';
import { ExamModule } from './modules/exam/exam.module';
import { StudentModule } from './modules/student/student.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { GuardianModule } from './modules/guardian/guardian.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { ExamResultModule } from './modules/examResult/examResult.module';
import { NoticeModule } from './modules/notice/notice.module';
import { AttendenceModule } from './modules/attendance/attendance.module';
import { FeeModule } from './modules/fee/fee.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { MailModule } from './modules/mail/mail.module';
import { ErrorExceptionFilter } from './common/filters/error-exception.filters';
import { SeederModule } from './modules/seeder/seeder.module';
import { JwtAuthGuard } from './modules/auth/guard/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guard/roles.guard';

@Module({
  imports: [
    AuthModule,
    UserModule,
    SubjectModule,
    ClassModule,
    ExamModule,
    StudentModule,
    TeacherModule,
    GuardianModule,
    ExpenseModule,
    ExamResultModule,
    NoticeModule,
    AttendenceModule,
    FeeModule,
    LeaderboardModule,
    SeederModule,
    ConfigModule.forRoot({
      load: configuration,
      isGlobal: true,
      expandVariables: true,
    }),
    PrismaModule,
    CloudinaryModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ErrorExceptionFilter,
    },
  ],
})
export class AppModule {}
