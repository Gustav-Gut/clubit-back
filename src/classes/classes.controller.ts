import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) { }

  @Post()
  create(@Body() createClassDto: CreateClassDto, @Request() req) {
    return this.classesService.create(createClassDto, req.user.schoolId);
  }

  @Get()
  findAll(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.classesService.findAll(req.user.schoolId, req.user, paginationDto, paginationDto.search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.classesService.findOne(id, req.user.schoolId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClassDto: any, @Request() req) {
    return this.classesService.update(id, updateClassDto, req.user.schoolId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.classesService.remove(id, req.user.schoolId);
  }

  // --- Enrollment Endpoints ---

  @Post(':id/enroll')
  enrollStudent(
    @Param('id') id: string,
    @Body() enrollDto: EnrollStudentDto,
    @Request() req
  ) {
    return this.classesService.enrollStudent(id, enrollDto, req.user.schoolId);
  }

  @Delete(':id/enroll/:studentId')
  unenrollStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @Request() req
  ) {
    return this.classesService.unenrollStudent(id, studentId, req.user.schoolId);
  }
}
