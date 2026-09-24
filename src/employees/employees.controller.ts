import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../users/enums/user-role.enum.js';

import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { QueryEmployeeDto } from './dto/query-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { EmployeesService } from './employees.service.js';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
@UseGuards(AuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '新增員工',
    description: '僅 admin 可以新增員工。',
  })
  @ApiCreatedResponse({
    description: '員工新增成功',
  })
  @ApiBadRequestResponse({
    description: 'Request Body 驗證失敗',
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token 不存在、無效或已過期',
  })
  @ApiForbiddenResponse({
    description: '目前角色沒有新增員工權限',
  })
  @ApiConflictResponse({
    description: 'nationalId 或 email 已存在',
  })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({
    summary: '取得員工列表',
    description: 'readonly 與 admin 皆可使用。支援搜尋條件與分頁。',
  })
  @ApiOkResponse({
    description: '成功取得員工列表',
  })
  @ApiBadRequestResponse({
    description: 'Query Parameter 驗證失敗',
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token 不存在、無效或已過期',
  })
  findAll(@Query() query: QueryEmployeeDto) {
    return this.employeesService.findAll(query);
  }

  @Get(':employeeNo')
  @ApiOperation({
    summary: '取得員工詳細資料',
    description: 'readonly 與 admin 皆可使用。',
  })
  @ApiOkResponse({
    description: '成功取得員工詳細資料',
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token 不存在、無效或已過期',
  })
  @ApiNotFoundResponse({
    description: '找不到指定員工',
  })
  findOne(@Param('employeeNo') employeeNo: string) {
    return this.employeesService.findOne(employeeNo);
  }

  @Patch(':employeeNo')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '修改員工資料',
    description: '僅 admin 可以修改員工資料。',
  })
  @ApiOkResponse({
    description: '員工資料修改成功',
  })
  @ApiBadRequestResponse({
    description: 'Request Body 驗證失敗',
  })
  @ApiUnauthorizedResponse({
    description: 'Access Token 不存在、無效或已過期',
  })
  @ApiForbiddenResponse({
    description: '目前角色沒有修改員工權限',
  })
  @ApiNotFoundResponse({
    description: '找不到指定員工',
  })
  @ApiConflictResponse({
    description: 'nationalId 或 email 已存在',
  })
  update(
    @Param('employeeNo') employeeNo: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(employeeNo, updateEmployeeDto);
  }
}
