import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const passwordHash = await bcrypt.hash(password, 12);

    const account = await this.accountsService.create(
      normalizedEmail,
      passwordHash,
    );

    return this.createAuthResponse(account.id, account.email);
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const account = await this.accountsService.findByEmail(normalizedEmail);

    if (!account) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      password,
      account.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createAuthResponse(account.id, account.email);
  }

  private async createAuthResponse(accountId: string, email: string) {
    const accessToken = await this.jwtService.signAsync({
      sub: accountId,
      email,
    });

    return {
      accessToken,
      account: {
        id: accountId,
        email,
      },
    };
  }
}
