import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { EmployeeStatus } from '../entities/employee.entity.js';
import { IsTaiwanNationalId } from '../../common/validators/taiwan-national-id.validator.js';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsTaiwanNationalId({
    message: 'nationalId is not a valid Taiwan national ID',
  })
  nationalId: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @IsDateString()
  hireDate: string;
}
