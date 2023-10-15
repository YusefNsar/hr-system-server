import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { FilterQuery, Model } from 'mongoose';
import { Attendance } from './schemas/attendance.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Employee } from 'src/employee/schemas/employee.schema';
import { EmployeeService } from 'src/employee/employee.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
    private readonly employeeService: EmployeeService,
  ) {}

  async create(
    createAttendanceDto: CreateAttendanceDto,
    reportedBy: string,
  ): Promise<Attendance> {
    const { employee, fromEpochTime, toEpochTime } = createAttendanceDto;

    const dateFrom = new Date(fromEpochTime);
    const dateTo = new Date(toEpochTime);
    this.validateAttendanceInterval(dateFrom, dateTo);

    //* Note: Both fromEpochTime and toEpochTime from same day
    const dateISO = dateFrom.toISOString();

    const conflictAttendance = await this.attendanceModel.findOne({
      employee,
      dateISO,
    });

    if (!!conflictAttendance) {
      throw new BadRequestException(
        'today attendance already exists for this employee',
      );
    }

    const attendance = new this.attendanceModel({
      fromEpochTime,
      toEpochTime,
      dateISO,
      employee,
      hr: reportedBy,
    });

    return attendance.save();
  }

  findAll(filters?: FilterQuery<Attendance>) {
    return this.attendanceModel
      .find(filters || {}, null, { populate: ['employee', 'hr'] })
      .lean()
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

  async getAnalytics(): Promise<AttendanceAnalytics> {
    // get the last 30 day attendances only
    const dateFromAMonth = this.getDateFromAMonth();
    const allAttendancesThisMonth = await this.findAll({
      dateISO: { $gt: dateFromAMonth },
    });

    const dateToday = new Date().toISOString().substring(0, 10);
    const millisecondsOfHour = 1000 * 60 * 60;

    // iterate over attendance and get hours worked for all employees and if they worked today from all attendances
    const employeesWithHoursWokred = allAttendancesThisMonth.reduce(
      (employees, attendance) => {
        const hoursWorked =
          (attendance.toEpochTime - attendance.fromEpochTime) /
          millisecondsOfHour;

        const hoursWorkedTotal = employees[attendance.employee._id]?.hours || 0;
        const haveOtherAttendanceToday =
          employees[attendance.employee._id]?.workedToday || false;

        employees[attendance.employee._id] = {
          ...attendance.employee,
          hours: hoursWorked + hoursWorkedTotal,
          workedToday:
            dateToday === attendance.dateISO.substring(0, 10) ||
            haveOtherAttendanceToday,
        };

        return employees;
      },
      {} as Record<string, Employee & { hours: number; workedToday: boolean }>,
    );

    //* Note: employees list here does not have employees how have no attendances recored, i.e. did not work this month
    const topPerformers = Object.values(employeesWithHoursWokred)
      .sort((employeeA, employeeB) => employeeB.hours - employeeA.hours)
      .slice(0, 5);

    const allEmployees = await this.employeeService.findAll();
    const didNotWorkToday = allEmployees
      .filter(
        (em) =>
          !employeesWithHoursWokred[em._id] ||
          !employeesWithHoursWokred[em._id].workedToday,
      )
      .slice(0, 5);

    return {
      topPerformers,
      didNotWorkToday,
    };
  }

  private validateAttendanceInterval(from: Date, to: Date): void {
    // TODO: Better handle different time zones between clients/servers, using epoch times is reducing the possible errors though

    if (from.getDate() !== to.getDate()) {
      throw new BadRequestException(
        'Attendance from and to times should be from the same day',
      );
    }

    if (from > to) {
      throw new BadRequestException('fromTime cannot be after toTime');
    }
  }

  private getDateFromAMonth() {
    const millisecondsOfAMonth = 1000 * 60 * 60 * 24 * 30;
    const timeNow = new Date();

    const fromAMonth = new Date(timeNow.getDate() - millisecondsOfAMonth);

    return fromAMonth.toISOString();
  }
}

export interface AttendanceAnalytics {
  // top 5 employees in hours worked this month
  topPerformers: Employee[];
  // 5 emplyees that did not work today yet
  didNotWorkToday: Employee[];
}
