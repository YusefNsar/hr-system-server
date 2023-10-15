import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { getModelToken } from '@nestjs/mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { Model } from 'mongoose';
import { EmployeeService } from '../employee/employee.service';
import { Employee } from '../employee/schemas/employee.schema';

describe('AttendanceController', () => {
  let controller: AttendanceController;
  let mockAttendanceModel: Model<AttendanceDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        AttendanceService,
        EmployeeService,
        {
          provide: getModelToken(Attendance.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Employee.name),
          useValue: Model,
        },
      ],
    }).compile();

    controller = module.get<AttendanceController>(AttendanceController);
    mockAttendanceModel = module.get<Model<AttendanceDocument>>(
      getModelToken(Attendance.name),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a attendance doc', async () => {
    // arrange
    const attendance = new Attendance();
    const attendanceID = '12345';
    const spy = jest
      .spyOn(mockAttendanceModel, 'findById')
      .mockResolvedValue(attendance as AttendanceDocument);

    // act
    await controller.findOne(attendanceID);

    // assert
    expect(spy).toBeCalled();
  });
});
