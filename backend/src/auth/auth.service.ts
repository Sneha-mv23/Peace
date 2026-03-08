import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      ...registerDto,
      password: registerDto.password,
    });

    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Registration successful',
      access_token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        country: user.country,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    // 1. Find user
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // 2. Check password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    // 3. Check MFA if enabled
    if (user.mfaEnabled) {
      if (!loginDto.mfaToken) {
        throw new UnauthorizedException('MFA token required');
      }
      const isValidToken = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: loginDto.mfaToken,
        window: 1,
      });
      if (!isValidToken) throw new UnauthorizedException('Invalid MFA token');
    }

    // 4. Sign JWT
    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      access_token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        country: user.country,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
      },
    };
  }

  async setupMfa(userId: string) {
    const secret = speakeasy.generateSecret({ name: 'Peace Platform' });

    await this.usersService.updateMfaSecret(userId, secret.base32);

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    return {
      message: 'Scan this QR code with Google Authenticator or Authy',
      qrCode: qrCodeUrl,
      manualKey: secret.base32,
    };
  }

  async enableMfa(userId: string, token: string) {
    const user = await this.usersService.findOne(userId);

    const isValid = speakeasy.totp.verify({
      secret: (user as any).mfaSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!isValid) throw new BadRequestException('Invalid MFA token — try again');

    await this.usersService.update(userId, { mfaEnabled: true } as any);

    return { message: 'MFA enabled successfully' };
  }

  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }
}