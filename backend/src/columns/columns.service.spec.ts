import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { EventsGateway } from '../events/events.gateway';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  column: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockEvents = { broadcast: jest.fn() };

describe('ColumnsService', () => {
  let service: ColumnsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventsGateway, useValue: mockEvents },
      ],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create column and broadcast event', async () => {
      const column = {
        id: 'col-1',
        name: 'To Do',
        order: 0,
        createdById: 'user-id',
        createdBy: { id: 'user-id', username: 'test' },
        cards: [],
      };
      mockPrisma.column.create.mockResolvedValue(column);

      const result = await service.create({ name: 'To Do', order: 0 }, 'user-id');

      expect(result).toEqual(column);
      expect(mockEvents.broadcast).toHaveBeenCalledWith('column:created', column);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if column does not exist', async () => {
      mockPrisma.column.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
