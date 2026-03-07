import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('facilities')
@UseGuards(JwtAuthGuard)
export class FacilitiesController {
    constructor(private readonly facilitiesService: FacilitiesService) { }

    @Post()
    create(@Body() createFacilityDto: CreateFacilityDto, @Request() req) {
        return this.facilitiesService.create(createFacilityDto, req.user.schoolId);
    }

    @Get()
    findAll(@Request() req) {
        return this.facilitiesService.findAll(req.user.schoolId);
    }

    @Get('calendar')
    getCalendar(@Request() req) {
        return this.facilitiesService.getCalendar(req.user.schoolId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.facilitiesService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFacilityDto: any, @Request() req) {
        return this.facilitiesService.update(id, updateFacilityDto, req.user.schoolId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.facilitiesService.remove(id, req.user.schoolId);
    }
}
