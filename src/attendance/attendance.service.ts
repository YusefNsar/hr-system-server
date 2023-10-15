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
    this.validateAttendanceInterval(dateFrom, dateTo);

    const attendance = new this.attendanceModel({
      fromEpochTime,
      toEpochTime,
      dateISO: dateFrom.toISOString(), //* Note: Both fromEpochTime and toEpochTime from same day
      employee,
      hr: reportedBy,
    });

    return attendance.save();
  }

  findAll() {
    return this.attendanceModel
      .find({}, null, { populate: ['employee', 'hr'] })
      .exec();
  }

  findOne(id: string) {
    return this.attendanceModel.findById(id, null, {
      populate: ['employee', 'hr'],
    });
  }

  update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    const { fromEpochTime, toEpochTime } = updateAttendanceDto;

    const dateFrom = new Date(fromEpochTime);
    const dateTo = new Date(toEpochTime);
    this.validateAttendanceInterval(dateFrom, dateTo);

    return this.attendanceModel.findByIdAndUpdate(
      id,
      {
        fromEpochTime,
        toEpochTime,
        dateISO: dateFrom.toISOString(),
      },
      {
        populate: ['employee', 'hr'],
        lean: true,
        new: true,
      },
    );
  }

  remove(id: string) {
    return this.attendanceModel.findByIdAndRemove(id);
  }

  private validateAttendanceInterval(from: Date, to: Date): void {
    // TODO: Better handle different time zones between clients/servers, using epoch times is reducing the possible errors though
    if (from.getDate() !== to.getDate()) {
      throw new BadRequestException(
        'Attendance from and to times should be from the same day',
      );
    }
  }
}
