import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: '登入 Email',
    example: 'admin@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '登入密碼',
    example: 'Admin123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
