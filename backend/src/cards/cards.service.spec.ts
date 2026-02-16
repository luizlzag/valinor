import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CardsService } from './cards.service';
import { EventsGateway } from '../events/events.gateway';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  column: { findUnique: jest.fn() },
  card: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockEvents = { broadcast: jest.fn() };

describe('CardsService', () => {
  let service: CardsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventsGateway, useValue: mockEvents },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw if column does not exist', async () => {
      mockPrisma.column.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          { title: 'Test', columnId: 'invalid-id' },
          'user-id',
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrisma.card.create).not.toHaveBeenCalled();
    });

    it('should create card and broadcast event', async () => {
      const column = { id: 'col-1', name: 'To Do' };
      const card = {
        id: 'card-1',
        title: 'Test',
        columnId: 'col-1',
        createdById: 'user-id',
        createdBy: { id: 'user-id', username: 'test' },
        column,
      };
      mockPrisma.column.findUnique.mockResolvedValue(column);
      mockPrisma.card.create.mockResolvedValue(card);

      const result = await service.create(
        { title: 'Test', columnId: 'col-1' },
        'user-id',
      );

      expect(result).toEqual(card);
      expect(mockEvents.broadcast).toHaveBeenCalledWith('card:created', card);
    });
  });

  describe('findAll', () => {
    it('should return cards with column and createdBy', async () => {
      const cards = [{ id: '1', title: 'Card 1', column: {}, createdBy: {} }];
      mockPrisma.card.findMany.mockResolvedValue(cards);

      const result = await service.findAll();

      expect(result).toEqual(cards);
      expect(mockPrisma.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { column: true, createdBy: true },
        }),
      );
    });
  });
});
