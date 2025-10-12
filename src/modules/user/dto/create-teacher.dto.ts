import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { NameDTO } from './create-student.dto';
import { BLOOD_GROUP, GENDER, TEACHER_TYPE } from '@prisma/client';
import { OmitType, PartialType } from '@nestjs/mapped-types';

class EducationalQualificationDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'university name must be required' })
  universityName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'subject must be required' })
  subject: string;

  @ApiPropertyOptional()
  @IsOptional()
  result: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'graduation must be required' })
  graduation: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsPositive()
  @IsOptional()
  completedYear: number;
}

export class CreateTeacherDTO {
  @ApiResponseProperty()
  @IsOptional()
  id: string;

  @IsOptional()
  @ApiProperty()
  teacherId: string;

  @IsIn(Object.keys(TEACHER_TYPE))
  @ApiProperty({ enum: Object.keys(TEACHER_TYPE) })
  type: TEACHER_TYPE;

  @ValidateNested()
  @IsObject()
  @Type(() => NameDTO)
  @ApiProperty()
  name: NameDTO;

  @IsIn(Object.keys(GENDER))
  @IsNotEmpty({ message: 'gender must be required' })
  @ApiProperty({ enum: Object.keys(GENDER) })
  gender: GENDER;

  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  @ApiProperty()
  email: string;

  @IsString({ message: 'contact no must be string' })
  @ApiProperty()
  contactNo: string;

  @IsNotEmpty({ message: 'blood group is required' })
  @IsIn(Object.keys(BLOOD_GROUP))
  @ApiProperty({ enum: Object.keys(BLOOD_GROUP) })
  bloodGroup: BLOOD_GROUP;

  @ApiProperty()
  @IsString({ message: 'designation must be string' })
  @IsNotEmpty({ message: 'designation is required' })
  designation: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNotEmpty({ message: 'salary is required' })
  @IsPositive({ message: 'salary must be positive number' })
  salary: number;

  @IsString({ message: 'subject must be string' })
  @IsNotEmpty({ message: 'subject is required' })
  @ApiProperty()
  subject: string;

  @ApiProperty()
  @ValidateNested()
  @IsObject()
  @Type(() => EducationalQualificationDTO)
  educationalQualification: EducationalQualificationDTO;

  @IsString({ message: 'image must be string' })
  @IsOptional()
  @ApiPropertyOptional()
  image: string;

  @IsDate({ message: 'date of birth must be in date format' })
  @IsNotEmpty({ message: 'date of birth is required' })
  @Type(() => Date)
  @ApiProperty()
  dateOfBirth: Date;

  @IsString({ message: 'address must be string' })
  @IsNotEmpty({ message: 'address is required' })
  @ApiProperty()
  address: string;

  @IsOptional()
  @ApiPropertyOptional()
  shortDescription: string;
}

export class UpdateNameDTO extends PartialType(NameDTO) {}
export class UpdateEducationalQualificationDTO extends PartialType(
  EducationalQualificationDTO,
) {}

export class UpdateTeacherDTO extends PartialType(
  OmitType(CreateTeacherDTO, ['name', 'educationalQualification'] as const),
) {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNameDTO)
  name?: UpdateNameDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEducationalQualificationDTO)
  educationalQualification?: UpdateEducationalQualificationDTO;
}
