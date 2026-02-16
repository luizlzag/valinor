import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  user: {
    create: jest.fn(),
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('fake-jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGuest', () => {
    it('should create guest user and return token', async () => {
      const user = {
        id: 'user-1',
        githubId: 'guest-abc123',
        username: 'Convidado_xyz',
        avatarUrl: null,
      };
      mockPrisma.user.create.mockResolvedValue(user);

      const result = await service.createGuest();

      expect(result).toEqual({
        access_token: 'fake-jwt-token',
        user: { id: user.id, username: user.username },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            username: expect.stringMatching(/^Convidado_/),
            avatarUrl: null,
          }),
        }),
      );
    });
  });
});
