import { Body, Controller, Get, Post } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Employee } from './schemas/employee.schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Get()
  async findAll(): Promise<Employee[]> {
    return this.employeeService.findAll();
  }

  @Post()
  async addEmployee(
    @Body('newEmployee') newEmployee: CreateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.employeeService.create(newEmployee);

    return employee;
  }
}
