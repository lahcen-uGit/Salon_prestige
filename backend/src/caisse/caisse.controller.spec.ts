import { Test, TestingModule } from '@nestjs/testing';
import { CaisseController } from './caisse.controller';

describe('CaisseController', () => {
  let controller: CaisseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaisseController],
    }).compile();

    controller = module.get<CaisseController>(CaisseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
