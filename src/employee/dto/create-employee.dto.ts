import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { EmployeeGroup } from '../schemas/employee.schema';

export class CreateEmployeeDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(EmployeeGroup)
  group: EmployeeGroup;
}
