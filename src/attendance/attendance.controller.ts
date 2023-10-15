import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JWTPayload } from 'src/auth/auth.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @Request() req: { user: JWTPayload },
  ) {
    return this.attendanceService.create(
      createAttendanceDto,
      req.user.id.toString(),
    );
  }

  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get('analytics')
  getAnalytics() {
    return this.attendanceService.getAnalytics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}
