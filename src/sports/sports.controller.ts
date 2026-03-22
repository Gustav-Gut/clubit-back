import { Controller, Get, Patch, Post, Delete, Param, Body } from '@nestjs/common';
import { SportsService } from './sports.service';
import { CurrentSchoolId } from '../auth/decorators/current-school-id.decorator';

@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) { }

  @Get('schema')
  async getSchema(@CurrentSchoolId() schoolId: string) {
    return this.sportsService.getEffectiveSchema(schoolId);
  }

  @Get('available')
  async getAvailableSports() {
    return this.sportsService.getAllSports();
  }

  @Post('associate')
  async associateSport(
    @CurrentSchoolId() schoolId: string,
    @Body('sportId') sportId: string
  ) {
    return this.sportsService.associateSport(schoolId, sportId);
  }

  @Delete('associate/:schoolSportId')
  async dissociateSport(
    @Param('schoolSportId') schoolSportId: string
  ) {
    return this.sportsService.dissociateSport(schoolSportId);
  }

  @Patch('config/:schoolSportId')
  async updateConfig(
    @Param('schoolSportId') schoolSportId: string,
    @Body() customFields: any
  ) {
    return this.sportsService.updateCustomSchema(schoolSportId, customFields);
  }
}
