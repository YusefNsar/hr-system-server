import { PickType } from '@nestjs/swagger';
import { CreateAttendanceDto } from './create-attendance.dto';

export class UpdateAttendanceDto extends PickType(CreateAttendanceDto, [
  'fromEpochTime',
  'toEpochTime',
]) {}
