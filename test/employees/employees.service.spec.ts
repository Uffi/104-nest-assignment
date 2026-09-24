import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EmployeesService } from '../../src/employees/employees.service.js';
import {
  Employee,
  EmployeeStatus,
} from '../../src/employees/entities/employee.entity.js';

describe('EmployeesService', () => {
  let service: EmployeesService;

  let repository: {
    findOne: ReturnType<typeof vi.fn>;
    findAndCount: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };

  const employee: Employee = {
    id: 1,
    employeeNo: '00001',
    name: 'Test User',
    nationalId: 'A123456789',
    email: 'test@example.com',
    department: 'RD',
    jobTitle: 'Frontend Engineer',
    status: EmployeeStatus.ACTIVE,
    hireDate: '2026-09-24',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    repository = {
      findOne: vi.fn(),
      findAndCount: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
    };

    service = new EmployeesService(
      repository as unknown as Repository<Employee>,
    );
  });

  it('should create employee and generate employeeNo', async () => {
    repository.findOne.mockResolvedValue(null);

    repository.create.mockReturnValue({
      ...employee,
      employeeNo: null,
    });

    repository.save
      .mockResolvedValueOnce({
        ...employee,
        employeeNo: null,
      })
      .mockResolvedValueOnce(employee);

    const result = await service.create({
      name: employee.name,
      nationalId: employee.nationalId,
      hireDate: employee.hireDate,
    });

    expect(result.employeeNo).toBe('00001');
    expect(repository.save).toHaveBeenCalledTimes(2);
  });

  it('should throw conflict when nationalId already exists', async () => {
    repository.findOne.mockResolvedValue(employee);

    await expect(
      service.create({
        name: 'Another User',
        nationalId: employee.nationalId,
        hireDate: '2026-09-24',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should return employee by employeeNo', async () => {
    repository.findOne.mockResolvedValue(employee);

    const result = await service.findOne('00001');

    expect(result).toEqual(employee);
  });

  it('should throw not found when employee does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne('99999')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should throw conflict when updating to duplicated email', async () => {
    repository.findOne.mockResolvedValueOnce(employee).mockResolvedValueOnce({
      ...employee,
      id: 2,
      employeeNo: '00002',
      email: 'used@example.com',
    });

    await expect(
      service.update('00001', {
        email: 'used@example.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should return employee list with pagination', async () => {
    repository.findAndCount.mockResolvedValue([[employee], 1]);

    const result = await service.findAll({
      page: 1,
      pageSize: 20,
    });

    expect(result.data).toHaveLength(1);

    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    });
  });
});
