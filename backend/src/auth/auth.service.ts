import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface GitHubProfile {
  id: number;
  login: string;
  avatar_url?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createGuest() {
    const guestId = `guest-${randomBytes(16).toString('hex')}`;
    const suffix = randomBytes(4).toString('hex');
    const user = await this.prisma.user.create({
      data: {
        githubId: guestId,
        username: `Convidado_${suffix}`,
        avatarUrl: null,
      },
    });
    return this.login(user);
  }

  async findOrCreateUser(profile: GitHubProfile) {
    const user = await this.prisma.user.upsert({
      where: { githubId: String(profile.id) },
      create: {
        githubId: String(profile.id),
        username: profile.login,
        avatarUrl: profile.avatar_url ?? null,
      },
      update: {
        username: profile.login,
        avatarUrl: profile.avatar_url ?? null,
      },
    });
    return user;
  }

  async login(user: { id: string; githubId: string; username: string }) {
    const payload = { sub: user.id, githubId: user.githubId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        githubId: true,
        username: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }
}
