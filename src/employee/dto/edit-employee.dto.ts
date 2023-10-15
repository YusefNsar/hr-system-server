import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  NotEquals,
} from 'class-validator';
import { EmployeeGroup } from '../schemas/employee.schema';

export class EditEmployeeDto {
  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  @IsOptional()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEnum(EmployeeGroup)
  @NotEquals(EmployeeGroup.HR)
  group: EmployeeGroup;
}
