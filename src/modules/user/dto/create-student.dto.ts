import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
} from '@nestjs/swagger';
import { BLOOD_GROUP, GENDER, STUDENT_ACCOUNT_STATUS } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class NameDTO {
  @IsString({ message: 'first name must be string' })
  @IsNotEmpty({ message: 'first name is required' })
  @ApiProperty()
  firstName: string;

  @IsString({ message: 'middle name must be string' })
  @IsOptional()
  @ApiPropertyOptional()
  middleName: string;

  @IsString({ message: 'last name must be string' })
  @IsNotEmpty({ message: 'last name is required' })
  @ApiProperty()
  lastName: string;
}

export class GuardianDTO {
  @IsString({ message: 'father name must be string' })
  @IsNotEmpty({ message: 'father name is required' })
  @ApiProperty()
  fatherName: string;

  @IsString({ message: 'father occupation must be string' })
  @IsNotEmpty({ message: 'father occupation is required' })
  @ApiProperty()
  fatherOccupation: string;

  @IsString({ message: 'father contact no must be string' })
  @IsNotEmpty({ message: 'father contact no is required' })
  @ApiProperty()
  fatherContactNo: string;

  @IsString({ message: 'mother name must be string' })
  @IsNotEmpty({ message: 'mother name is required' })
  @ApiProperty()
  motherName: string;

  @IsString({ message: 'mother occupation must be string' })
  @IsNotEmpty({ message: 'mother occupation is required' })
  @ApiProperty()
  motherOccupation: string;

  @IsString({ message: 'mother contact no must be string' })
  @IsNotEmpty({ message: 'mother contact no is required' })
  @ApiProperty()
  motherContactNo: string;
}

export class CreateStudentDTO {
  @ApiResponseProperty()
  @IsOptional()
  id: string;

  @IsOptional()
  @ApiProperty()
  studentId: string;

  @ValidateNested()
  @IsObject()
  @Type(() => NameDTO)
  @ApiProperty()
  name: NameDTO;

  @IsIn(Object.keys(GENDER))
  @IsNotEmpty({ message: 'gender must be required' })
  @ApiProperty({ enum: Object.keys(GENDER) })
  gender: GENDER;

  @IsIn(Object.keys(STUDENT_ACCOUNT_STATUS))
  @IsOptional()
  @ApiProperty({ enum: Object.keys(STUDENT_ACCOUNT_STATUS) })
  status: STUDENT_ACCOUNT_STATUS;

  @IsDate({ message: 'date of birth must be in date format' })
  @IsNotEmpty({ message: 'date of birth is required' })
  @Type(() => Date)
  @ApiProperty()
  dateOfBirth: Date;

  @Type(() => Number)
  @IsInt({ message: 'admission year must be number' })
  @IsNotEmpty({ message: 'admission year is required' })
  @ApiProperty()
  admissionYear: number;

  @ValidateNested()
  @IsObject()
  @Type(() => GuardianDTO)
  @ApiProperty()
  guardian: GuardianDTO;

  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional()
  email: string;

  @IsString({ message: 'contact no must be string' })
  @IsOptional()
  @ApiPropertyOptional()
  contactNo: string;

  @IsNotEmpty({ message: 'blood group is required' })
  @IsIn(Object.keys(BLOOD_GROUP))
  @ApiProperty({ enum: Object.keys(BLOOD_GROUP) })
  bloodGroup: BLOOD_GROUP;

  @IsString({ message: 'class name must be string' })
  @IsNotEmpty({ message: 'class name is required' })
  @ApiProperty()
  className: string;

  @IsString({ message: 'class roll must be string' })
  @IsNotEmpty({ message: 'class roll is required' })
  @ApiProperty()
  classRoll: string;

  @IsString({ message: 'section must be string' })
  @IsNotEmpty({ message: 'section is required' })
  @ApiProperty()
  section: string;

  @IsString({ message: 'school name must be string' })
  @IsNotEmpty({ message: 'school name is required' })
  @ApiProperty()
  schoolName: string;

  @IsString({ message: 'image must be string' })
  @IsOptional()
  @ApiPropertyOptional()
  image: string;

  @IsString({ message: 'address must be string' })
  @IsNotEmpty({ message: 'address is required' })
  @ApiProperty()
  address: string;

  @IsString({ message: 'description must be string' })
  @IsOptional()
  @ApiPropertyOptional()
  shortDescription: string;
}

export class UpdateNameDTO extends PartialType(NameDTO) {}
export class UpdateGuardianDTO extends PartialType(GuardianDTO) {}

// 👇 Omit name & guardian so we can redefine them
export class UpdateStudentDTO extends PartialType(
  OmitType(CreateStudentDTO, ['name', 'guardian'] as const),
) {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNameDTO)
  name?: UpdateNameDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateGuardianDTO)
  guardian?: UpdateGuardianDTO;
}
