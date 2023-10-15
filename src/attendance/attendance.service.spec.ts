import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { EmployeeService } from '../employee/employee.service';
import { getModelToken } from '@nestjs/mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { Model } from 'mongoose';
import { Employee } from '../employee/schemas/employee.schema';
import { BadRequestException } from '@nestjs/common';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let mockAttendanceModel: Model<AttendanceDocument>;

  beforeEach(async () => {
    jest.mock('mongoose');
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<AttendanceService>(AttendanceService);
    mockAttendanceModel = module.get<Model<AttendanceDocument>>(
      getModelToken(Attendance.name),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error because fromEpochTime is latter than toEpochTime', async () => {
    // arrange
    const createAttendanceBody = {
      // fromEpochTime is latter than toEpochTime
      fromEpochTime: 1697396457445, // 10 PM
      toEpochTime: 1697390457445, // 8 PM
      employee: '2',
    };
    const hrEmployeeId = '1';
    mockAttendanceModel.findOne = jest.fn().mockResolvedValue(null);

    // act
    const t = async () => {
      await service.create(createAttendanceBody, hrEmployeeId);
    };

    // assert
    await expect(t).rejects.toThrow(BadRequestException);
  });

  it('should throw error because fromEpochTime is from a different day than toEpochTime', async () => {
    // arrange
    const createAttendanceBody = {
      // fromEpochTime and toEpochTime are from different days
      fromEpochTime: 1697306457445, // 14 Oct
      toEpochTime: 1697390457445, // 15 Oct
      employee: '2',
    };
    const hrEmployeeId = '1';
    mockAttendanceModel.findOne = jest.fn().mockResolvedValue(null);

    // act
    const t = async () => {
      await service.create(createAttendanceBody, hrEmployeeId);
    };

    // assert
    await expect(t).rejects.toThrow(BadRequestException);
  });

  it('should creates attendance normally', async () => {
    // arrange
    const createAttendanceBody = {
      // fromEpochTime and toEpochTime are from different days
      fromEpochTime: 1697385457445, // 7 PM, 15 Oct
      toEpochTime: 1697390457445, // 8 PM, 15 Oct
      employee: '2',
    };
    const hrEmployeeId = '1';

    mockAttendanceModel.findOne = jest.fn().mockResolvedValue(null);
    mockAttendanceModel.create = jest.fn();

    // act
    await service.create(createAttendanceBody, hrEmployeeId);

    // assert
    expect(mockAttendanceModel.create).toHaveBeenCalled();
  });
});
