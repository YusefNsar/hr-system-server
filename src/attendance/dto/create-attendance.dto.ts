import { IsMongoId, IsNumber, Max, Min } from 'class-validator';

const YEAR_2000_EPOCH_TIME = 946684800000;
const YEAR_3000_EPOCH_TIME = 32503680000000;

export class CreateAttendanceDto {
  @IsNumber()
  @Min(YEAR_2000_EPOCH_TIME)
  @Max(YEAR_3000_EPOCH_TIME)
  fromEpochTime: number;

  @IsNumber()
  @Min(YEAR_2000_EPOCH_TIME)
  @Max(YEAR_3000_EPOCH_TIME)
  toEpochTime: number;

  @IsMongoId()
  employee: string;
}
