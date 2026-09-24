import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: '使用者登入',
    description:
      '使用 Email 與密碼登入，成功後取得 Access Token 與 Refresh Token。',
  })
  @ApiResponse({
    status: 201,
    description: '登入成功',
  })
  @ApiBadRequestResponse({
    description: 'Request 格式或欄位驗證失敗',
  })
  @ApiUnauthorizedResponse({
    description: 'Email 或密碼錯誤',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('refresh')
  @ApiOperation({
    summary: '更新 Token',
    description:
      '使用有效的 Refresh Token 取得新的 Access Token 與 Refresh Token。',
  })
  @ApiResponse({
    status: 201,
    description: 'Token 更新成功',
  })
  @ApiBadRequestResponse({
    description: 'Request 格式或欄位驗證失敗',
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh Token 無效或已過期',
  })
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }
}
