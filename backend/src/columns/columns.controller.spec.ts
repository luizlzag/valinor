import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';

const mockColumnsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ColumnsController', () => {
  let controller: ColumnsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColumnsController],
      providers: [{ provide: ColumnsService, useValue: mockColumnsService }],
    }).compile();

    controller = module.get<ColumnsController>(ColumnsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should return columns from service', async () => {
    const columns = [{ id: '1', name: 'To Do', cards: [] }];
    mockColumnsService.findAll.mockResolvedValue(columns);

    const result = await controller.findAll();

    expect(result).toEqual(columns);
    expect(mockColumnsService.findAll).toHaveBeenCalled();
  });
});
