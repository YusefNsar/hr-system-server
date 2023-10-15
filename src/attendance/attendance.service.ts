import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Model } from 'mongoose';
import { Attendance } from './schemas/attendance.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
  ) {}

  async create(
    createAttendanceDto: CreateAttendanceDto,
    reportedBy: string,
  ): Promise<Attendance> {
    const { employee, fromEpochTime, toEpochTime } = createAttendanceDto;
    const dateFrom = new Date(fromEpochTime);
    const dateTo = new Date(toEpochTime);

    // TODO: Better handle different time zones between clients/servers, using epoch times is reducing the possible errors though
    if (dateFrom.getDate() !== dateTo.getDate()) {
      throw new BadRequestException(
        'Attendance from and to times should be from the same day',
      );
    }

    const attendance = new this.attendanceModel({
      ...createAttendanceDto,
      dateISO: dateFrom.toISOString(), //* Note: Both fromEpochTime and toEpochTime from same day
      employee,
      hr: reportedBy,
    });

    return attendance.save();
  }

  findAll() {
    return `This action returns all attendance`;
  }

  findOne(id: number) {
    return `This action returns a #${id} attendance`;
  }

  update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    return `This action updates a #${id} attendance`;
  }

  remove(id: number) {
    return `This action removes a #${id} attendance`;
  }
}
