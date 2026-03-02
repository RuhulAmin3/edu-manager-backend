import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';

export class CreateSubjectDTO {
  @IsInt({ message: 'subject code must be a number' })
  @IsNotEmpty({ message: 'subject code is required' })
  @Transform(({ value }) => parseInt(value, 10)) // Correctly transform value to a number
  code: number;

  @IsString()
  @IsNotEmpty({ message: 'title is required' })
  @ApiProperty()
  title: string;
}

export class UpdateSubjectDTO extends PartialType(CreateSubjectDTO) {}
