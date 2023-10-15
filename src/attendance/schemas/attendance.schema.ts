import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Employee } from '../../employee/schemas/employee.schema';

export type AttendanceDocument = HydratedDocument<Attendance>;

@Schema()
export class Attendance {
  // using epoch time in milliseconds, e.g. 1697335346000
  // the attendance time intervals will be always in the same day
  @Prop({ required: true })
  fromEpochTime: number;

  @Prop({ required: true })
  toEpochTime: number;

  // saving attendance date for a performance boost in some queries
  @Prop({ required: true })
  dateISO: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employee: Employee;

  // hr who recorded the attendance
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  hr: Employee;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
