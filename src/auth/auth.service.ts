import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';

import { UsersService } from '../users/users.service.js';

type TokenPayload = {
  sub: number;
  email: string;
  role: string;
  tokenType: 'access' | 'refresh';
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('email or password is incorrect');
    }

    const passwordMatched = await compare(password, user.passwordHash);

    if (!passwordMatched) {
      throw new UnauthorizedException('email or password is incorrect');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );

      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException();
      }

      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException();
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('refresh token is invalid or expired');
    }
  }

  private async generateTokens(userId: number, email: string, role: string) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: userId,
        email,
        role,
        tokenType: 'access',
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: '1h',
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
        email,
        role,
        tokenType: 'refresh',
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user: {
        id: userId,
        email,
        role,
      },
    };
  }
}
