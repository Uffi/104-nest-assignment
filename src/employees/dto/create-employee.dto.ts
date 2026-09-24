import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsTaiwanNationalId } from '../../common/validators/taiwan-national-id.validator.js';
import { EmployeeStatus } from '../entities/employee.entity.js';

export class CreateEmployeeDto {
  @ApiProperty({
    description: '員工姓名',
    example: '王小明',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '台灣身分證字號',
    example: 'A123456789',
  })
  @IsString()
  @IsNotEmpty()
  @IsTaiwanNationalId()
  nationalId: string;

  @ApiPropertyOptional({
    description: 'Email',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: '部門',
    example: 'RD',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: '職稱',
    example: 'Frontend Engineer',
  })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({
    description: '員工狀態，未提供時預設為 ACTIVE',
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiProperty({
    description: '到職日',
    example: '2026-09-24',
    type: String,
    format: 'date',
  })
  @IsDateString()
  hireDate: string;
}
