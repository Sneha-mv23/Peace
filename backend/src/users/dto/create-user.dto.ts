import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({ example: 'John Smith' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@embassy.gov' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'United States' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({ enum: UserRole, default: UserRole.DIPLOMAT })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ example: 'en', required: false })
  @IsOptional()
  @IsString()
  preferred_language?: string;
}