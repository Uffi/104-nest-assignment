import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from 'typeorm';
import { QueryEmployeeDto } from './dto/query-employee.dto.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { Employee, EmployeeStatus } from './entities/employee.entity.js';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const existingEmployee = await this.employeeRepository.findOne({
      where: {
        nationalId: createEmployeeDto.nationalId,
      },
    });

    if (existingEmployee) {
      throw new ConflictException('nationalId already exists');
    }

    if (createEmployeeDto.email) {
      const existingEmail = await this.employeeRepository.findOne({
        where: {
          email: createEmployeeDto.email,
        },
      });

      if (existingEmail) {
        throw new ConflictException('email already exists');
      }
    }

    const employee = this.employeeRepository.create({
      ...createEmployeeDto,
      employeeNo: null,
      status: createEmployeeDto.status ?? EmployeeStatus.ACTIVE,
    });

    const savedEmployee = await this.employeeRepository.save(employee);

    savedEmployee.employeeNo = savedEmployee.id.toString().padStart(5, '0');

    return this.employeeRepository.save(savedEmployee);
  }

  async findAll(query: QueryEmployeeDto) {
    const { name, email, department, jobTitle, status, page, pageSize } = query;

    const [data, total] = await this.employeeRepository.findAndCount({
      select: {
        employeeNo: true,
        name: true,
        email: true,
        department: true,
        jobTitle: true,
        status: true,
        hireDate: true,
      },
      where: {
        ...(name && { name: Like(`%${name}%`) }),
        ...(email && { email: Like(`%${email}%`) }),
        ...(department && { department }),
        ...(jobTitle && {
          jobTitle: Like(`%${jobTitle}%`),
        }),
        ...(status && { status }),
      },
      order: {
        id: 'DESC',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(employeeNo: string) {
    const employee = await this.employeeRepository.findOne({
      where: { employeeNo },
    });

    if (!employee) {
      throw new NotFoundException('employee not found');
    }

    return employee;
  }

  async update(employeeNo: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOne(employeeNo);

    if (
      updateEmployeeDto.nationalId &&
      updateEmployeeDto.nationalId !== employee.nationalId
    ) {
      const existingEmployee = await this.employeeRepository.findOne({
        where: {
          nationalId: updateEmployeeDto.nationalId,
        },
      });

      if (existingEmployee) {
        throw new ConflictException('nationalId already exists');
      }
    }

    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingEmail = await this.employeeRepository.findOne({
        where: {
          email: updateEmployeeDto.email,
        },
      });

      if (existingEmail) {
        throw new ConflictException('email already exists');
      }
    }

    Object.assign(employee, updateEmployeeDto);

    return this.employeeRepository.save(employee);
  }
}
