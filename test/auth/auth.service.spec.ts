import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../src/auth/auth.service.js';
import { UsersService } from '../../src/users/users.service.js';
import { UserRole } from '../../src/users/enums/user-role.enum.js';

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  let usersService: {
    findByEmail: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
  };

  let jwtService: {
    signAsync: ReturnType<typeof vi.fn>;
    verifyAsync: ReturnType<typeof vi.fn>;
  };

  let configService: {
    getOrThrow: ReturnType<typeof vi.fn>;
  };

  const user = {
    id: 1,
    email: 'admin@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    usersService = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
    };

    jwtService = {
      signAsync: vi.fn(),
      verifyAsync: vi.fn(),
    };

    configService = {
      getOrThrow: vi.fn((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') {
          return 'access-secret';
        }

        if (key === 'JWT_REFRESH_SECRET') {
          return 'refresh-secret';
        }

        return '';
      }),
    };

    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );

    vi.clearAllMocks();
  });

  it('should login successfully', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    vi.mocked(compare).mockResolvedValue(true);

    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await service.login('admin@example.com', 'Admin123!');

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.expiresIn).toBe(3600);

    expect(result.user).toEqual({
      id: 1,
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    });
  });

  it('should throw unauthorized when user does not exist', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login('unknown@example.com', 'password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw unauthorized when password is incorrect', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    vi.mocked(compare).mockResolvedValue(false);

    await expect(
      service.login('admin@example.com', 'wrong-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should refresh tokens successfully', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      tokenType: 'refresh',
    });

    usersService.findById.mockResolvedValue(user);

    jwtService.signAsync
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');

    const result = await service.refresh('valid-refresh-token');

    expect(result.accessToken).toBe('new-access-token');

    expect(result.refreshToken).toBe('new-refresh-token');

    expect(result.user.role).toBe(UserRole.ADMIN);
  });

  it('should reject access token used as refresh token', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      tokenType: 'access',
    });

    await expect(service.refresh('access-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should reject invalid refresh token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    await expect(service.refresh('invalid-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
