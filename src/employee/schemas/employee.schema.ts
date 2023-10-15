import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EmployeeDocument = HydratedDocument<Employee>;
export enum EmployeeGroup {
  HR = 'hr',
  EXECUTIVE = 'executive',
  MANAGER = 'manager',
  OPERATIONS = 'operations',
  BUSINESS = 'business',
  ACCOUNTANT = 'accountant',
  MARKETING = 'marketing',
  IT = 'it',
  OTHERS = 'others',
}

@Schema()
export class Employee {
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  group: EmployeeGroup;

  @Prop()
  password: string;

  @Prop({ default: false })
  isVerified: boolean;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
