import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  createGuest: jest.fn(),
  findOrCreateUser: jest.fn(),
  login: jest.fn(),
  findById: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('guest', () => {
    it('should return token and user from auth service', async () => {
      const response = {
        access_token: 'jwt-token',
        user: { id: '1', username: 'Convidado_abc' },
      };
      mockAuthService.createGuest.mockResolvedValue(response);

      const result = await controller.guest();

      expect(result).toEqual(response);
      expect(mockAuthService.createGuest).toHaveBeenCalled();
    });
  });
});
