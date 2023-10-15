import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from './employee.service';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let mockEmployeeModel: Model<EmployeeDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getModelToken(Employee.name),
          useValue: Model,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    mockEmployeeModel = module.get<Model<EmployeeDocument>>(
      getModelToken(Employee.name),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an employee', async () => {
    // arrange
    const employee = {
      _id: '1',
    };
    const spy = jest
      .spyOn(mockEmployeeModel, 'create')
      .mockResolvedValue(employee as any);

    // act
    await service.create(employee);

    // assert
    expect(spy).toBeCalled();
  });
});
