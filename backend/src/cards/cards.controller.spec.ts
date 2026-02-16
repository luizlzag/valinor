import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

const mockCardsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByColumn: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CardsController', () => {
  let controller: CardsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [{ provide: CardsService, useValue: mockCardsService }],
    }).compile();

    controller = module.get<CardsController>(CardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should return cards from service', async () => {
    const cards = [{ id: '1', title: 'Card 1' }];
    mockCardsService.findAll.mockResolvedValue(cards);

    const result = await controller.findAll();

    expect(result).toEqual(cards);
    expect(mockCardsService.findAll).toHaveBeenCalled();
  });

  it('findOne should return card by id', async () => {
    const card = { id: '1', title: 'Card 1' };
    mockCardsService.findOne.mockResolvedValue(card);

    const result = await controller.findOne('1');

    expect(result).toEqual(card);
    expect(mockCardsService.findOne).toHaveBeenCalledWith('1');
  });
});
