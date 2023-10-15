import { IsEmail, IsEnum, IsNotEmpty, NotEquals } from 'class-validator';
import { EmployeeGroup } from '../schemas/employee.schema';

export class CreateEmployeeDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(EmployeeGroup)
  @NotEquals(EmployeeGroup.HR)
  group: EmployeeGroup;
}
