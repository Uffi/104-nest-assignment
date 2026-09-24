import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: '登入時取得的 Refresh Token',
    example: '<refreshToken>',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
