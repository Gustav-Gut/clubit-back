import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException } from '@nestjs/common';
import { CurrentSchoolId } from '../auth/decorators/current-school-id.decorator';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) { }

  @Roles(Role.ADMIN)
  @Post()
  create(
    @Body() createPlanDto: CreatePlanDto,
    @CurrentSchoolId() schoolId: string
  ) {
    return this.plansService.create(schoolId, createPlanDto);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll(
    @CurrentSchoolId() schoolId: string) {
    return this.plansService.findAll(schoolId);
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentSchoolId() schoolId: string
  ) {
    return this.plansService.findOne(id, schoolId);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
    @CurrentSchoolId() schoolId: string
  ) {
    return this.plansService.update(id, schoolId, updatePlanDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentSchoolId() schoolId: string
  ) {
    return this.plansService.remove(id, schoolId);
  }
}