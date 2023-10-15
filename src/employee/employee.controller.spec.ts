import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from './employee.controller';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { EmployeeService } from './employee.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';

describe('EmployeeController', () => {
  let controller: EmployeeController;
  let mockEmployeeModel: Model<EmployeeDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        EmployeeService,
        {
          provide: getModelToken(Employee.name),
          useValue: Model,
        },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
    mockEmployeeModel = module.get<Model<EmployeeDocument>>(
      getModelToken(Employee.name),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find all employee', async () => {
    // arrange
    const employee = {
      _id: '1',
    } as EmployeeDocument;
    const spy = jest
      .spyOn(mockEmployeeModel, 'find')
      .mockReturnValue({ exec: async () => [employee] } as Query<
        any,
        EmployeeDocument,
        any
      >);

    // act
    await controller.findAll();

    // assert
    expect(spy).toBeCalled();
  });
});
