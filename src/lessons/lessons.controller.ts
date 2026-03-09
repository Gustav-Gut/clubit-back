import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) { }

  @Post()
  create(@Body() createLessonDto: CreateLessonDto, @Request() req) {
    return this.lessonsService.create(createLessonDto, req.user.schoolId);
  }

  @Get()
  findAll(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.lessonsService.findAll(req.user.schoolId, req.user, paginationDto, paginationDto.search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.lessonsService.findOne(id, req.user.schoolId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLessonDto: any, @Request() req) {
    return this.lessonsService.update(id, updateLessonDto, req.user.schoolId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.lessonsService.remove(id, req.user.schoolId);
  }

  // --- Enrollment Endpoints ---

  @Post(':id/enroll')
  enrollStudent(
    @Param('id') id: string,
    @Body() enrollDto: EnrollStudentDto,
    @Request() req
  ) {
    return this.lessonsService.enrollStudent(id, enrollDto, req.user.schoolId);
  }

  @Delete(':id/enroll/:studentId')
  unenrollStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @Request() req
  ) {
    return this.lessonsService.unenrollStudent(id, studentId, req.user.schoolId);
  }
}
