import { PickType } from '@nestjs/mapped-types';
import { CreateAttendanceDto } from './create-attendance.dto';

export class UpdateAttendanceDto extends PickType(CreateAttendanceDto, [
  'fromEpochTime',
  'toEpochTime',
]) {}
