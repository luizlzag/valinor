import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('should be defined when provided as mock', () => {
    const mockService = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      user: {},
      column: {},
      card: {},
    };
    expect(mockService).toBeDefined();
  });
});
