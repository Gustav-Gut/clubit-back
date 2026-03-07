import { Controller, Post, Body, Get, Param, Request, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceSessionDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assuming you have standard NestJS auth

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Post('session')
  submitAttendance(@Body() dto: CreateAttendanceSessionDto, @Request() req) {
    return this.attendanceService.submitAttendance(dto, req.user.id, req.user.schoolId);
  }

  @Get('class/:classId')
  getClassHistory(@Param('classId') classId: string, @Request() req) {
    return this.attendanceService.getClassAttendanceHistory(classId, req.user.schoolId);
  }

  @Get('student/:studentId/class/:classId')
  getStudentHistory(
    @Param('studentId') studentId: string,
    @Param('classId') classId: string,
    @Request() req
  ) {
    return this.attendanceService.getStudentAttendance(studentId, classId, req.user.schoolId);
  }
}
