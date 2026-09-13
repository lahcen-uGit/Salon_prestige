import { Test, TestingModule } from '@nestjs/testing';
import { EmployesController } from './employes.controller';

describe('EmployesController', () => {
  let controller: EmployesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployesController],
    }).compile();

    controller = module.get<EmployesController>(EmployesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
