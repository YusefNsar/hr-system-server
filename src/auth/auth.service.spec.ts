import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, HASH_SALT } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { EmployeeService } from '../employee/employee.service';
import { getModelToken } from '@nestjs/mongoose';
import {
  Employee,
  EmployeeDocument,
  EmployeeGroup,
} from '../employee/schemas/employee.schema';
import { Model } from 'mongoose';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let mockEmployeeModel: Model<EmployeeDocument>;
  let config: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        ConfigService,
        EmployeeService,
        {
          provide: getModelToken(Employee.name),
          useValue: Model,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockEmployeeModel = module.get<Model<EmployeeDocument>>(
      getModelToken(Employee.name),
    );
    config = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should not login because no email exists', async () => {
    // arrange
    const email = 'yusef@nsar.com';
    const password = '123123abc';

    // employee with this email not found
    mockEmployeeModel.findOne = jest.fn().mockResolvedValue(null);

    // act
    const t = () => service.signIn(email, password);

    // assert
    await expect(t).rejects.toThrow(UnauthorizedException);
  });

  it('should not login because employee not an hr', async () => {
    // arrange
    const email = 'yusef@nsar.com';
    const password = '123123abc';

    // employee is an accountant not an hr
    mockEmployeeModel.findOne = jest
      .fn()
      .mockResolvedValue({ group: EmployeeGroup.ACCOUNTANT });

    // act
    const t = () => service.signIn(email, password);

    // assert
    await expect(t).rejects.toThrow(UnauthorizedException);
  });

  it('should not login because of wrong password', async () => {
    // arrange
    const email = 'yusef@nsar.com';
    const correctPassword = '123123abcd';
    const hashedPassword = bcrypt.hashSync(correctPassword, HASH_SALT);
    const wrongPassword = '123123abc';

    // wrong password
    mockEmployeeModel.findOne = jest.fn().mockResolvedValue({
      group: EmployeeGroup.HR,
      password: hashedPassword,
    });

    // act
    const t = () => service.signIn(email, wrongPassword);

    // assert
    await expect(t).rejects.toThrow(UnauthorizedException);
  });

  it('should login successfully', async () => {
    // arrange
    const email = 'yusef@nsar.com';
    const password = '123123abc';
    const hashedPassword = bcrypt.hashSync(password, HASH_SALT);
    const employeeId = '1';

    // wrong password
    mockEmployeeModel.findOne = jest.fn().mockResolvedValue({
      _id: employeeId,
      group: EmployeeGroup.HR,
      password: hashedPassword,
    });
    config.get = jest.fn().mockReturnValue('jwtKey');

    // act
    const payload = await service.signIn(email, password);

    // assert
    expect(payload?.access_token).toBeDefined();
    expect(payload?.employee).toBeDefined();
    expect(payload?.employee?._id).toEqual(employeeId);
  });
});
