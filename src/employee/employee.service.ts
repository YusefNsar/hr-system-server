import { FilterQuery, Model } from 'mongoose';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
  ) {}

  async create(newEmployee: Partial<Employee>): Promise<EmployeeDocument> {
    const createdEmployeeDoc = new this.employeeModel(newEmployee);

    try {
      const createdEmployee = await createdEmployeeDoc.save();
      return createdEmployee;
    } catch (err) {
      if ((err.message as string).startsWith('E11000 duplicate key error')) {
        throw new BadRequestException('Email already exists');
      }

      throw new InternalServerErrorException(err);
    }
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeModel.find().exec();
  }

  async findOne(
    filter: FilterQuery<Employee>,
  ): Promise<EmployeeDocument | null> {
    return this.employeeModel.findOne(filter);
  }
}
