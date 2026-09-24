import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { EmployeeStatus } from '../entities/employee.entity.js';

export class QueryEmployeeDto {
  @ApiPropertyOptional({
    description: '姓名，模糊搜尋',
    example: '王',
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Email，模糊搜尋',
    example: 'example.com',
    type: String,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: '部門，精確搜尋',
    example: 'RD',
    type: String,
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: '職稱，模糊搜尋',
    example: 'Frontend',
    type: String,
  })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({
    description: '員工狀態',
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({
    description: '頁碼，從 1 開始',
    example: 1,
    default: 1,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    description: '每頁筆數',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;
}
