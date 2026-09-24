import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity.js';
import { UserRole } from './enums/user-role.enum.js';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedUser(
      'admin@example.com',
      process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!',
      UserRole.ADMIN,
    );

    await this.seedUser(
      'readonly@example.com',
      process.env.SEED_READONLY_PASSWORD ?? 'Readonly123!',
      UserRole.READONLY,
    );
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findById(id: number) {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  private async seedUser(email: string, password: string, role: UserRole) {
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      return;
    }

    const passwordHash = await hash(password, 10);

    const user = this.userRepository.create({
      email,
      passwordHash,
      role,
    });

    await this.userRepository.save(user);
  }
}
