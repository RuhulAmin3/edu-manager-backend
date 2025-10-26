import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { NameDTO } from './create-student.dto';
import { BLOOD_GROUP, GENDER, GUARDIAN_ACCOUNT_STATUS } from '@prisma/client';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export class CreateGuardianDTO {
  @ApiResponseProperty()
  @IsOptional()
  id: string;

  @IsOptional()
  @ApiProperty()
  guardianId: string;

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
  @IsOptional()
  @ApiProperty()
  email: string;

  @IsString({ message: 'contact no must be string' })
  @IsNotEmpty({ message: 'contact no is required' })
  @ApiProperty()
  contactNo: string;

  @IsString({ message: 'occupation no must be string' })
  @IsNotEmpty({ message: 'occupation is required' })
  @ApiProperty()
  occupation: string;

  @IsNotEmpty({ message: 'blood group is required' })
  @IsIn(Object.keys(BLOOD_GROUP))
  @ApiProperty({ enum: Object.keys(BLOOD_GROUP) })
  bloodGroup: BLOOD_GROUP;

  @IsString({ message: 'image must be string' })
  @IsOptional()
  @ApiPropertyOptional()
  image: string;

  @IsNotEmpty({ message: 'account status is required' })
  @IsIn(Object.keys(GUARDIAN_ACCOUNT_STATUS))
  @ApiProperty({ enum: Object.keys(GUARDIAN_ACCOUNT_STATUS) })
  @IsOptional()
  accountStatus: GUARDIAN_ACCOUNT_STATUS;

  @IsString({ message: 'address must be string' })
  @IsNotEmpty({ message: 'address is required' })
  @ApiProperty()
  address: string;

  @IsArray()
  @IsNotEmpty({ message: 'students is required' })
  students: string[];

  @IsOptional()
  @IsString({ message: 'password must be string' })
  @ApiResponseProperty()
  password: string;

  @IsOptional()
  @ApiPropertyOptional()
  shortDescription: string;
}

export class UpdateNameDTO extends PartialType(NameDTO) {}

export class UpdateGuardianDTO extends PartialType(
  OmitType(CreateGuardianDTO, ['name'] as const),
) {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNameDTO)
  name?: UpdateNameDTO;
}
