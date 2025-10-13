import { registerAs } from '@nestjs/config';

export const USER_CONFIG = registerAs('USER', () => {
  return {
    student_pass: process.env.STUDENT_PASS,
    teacher_pass: process.env.TEACHER_PASS,
    guardian_pass: process.env.GUARDIAN_PASS,
  };
});
