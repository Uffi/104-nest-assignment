import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, unique: true, nullable: true })
  employeeNo: string | null;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', unique: true, length: 20 })
  nationalId: string;

  @Column({ type: 'varchar', nullable: true, unique: true, length: 255 })
  email: string | null;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  department: string | null;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  jobTitle: string | null;

  @Column({ type: 'text', default: EmployeeStatus.ACTIVE })
  status: EmployeeStatus;

  @Column({ type: 'date' })
  hireDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
