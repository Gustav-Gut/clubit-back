import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { SportsService } from './sports.service';
import { CurrentSchoolId } from '../auth/decorators/current-school-id.decorator';

@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) { }

  @Get('schema')
  async getSchema(@CurrentSchoolId() schoolId: string) {
    return this.sportsService.getEffectiveSchema(schoolId);
  }

  @Patch('config/:schoolSportId')
  async updateConfig(
    @Param('schoolSportId') schoolSportId: string,
    @Body() customFields: any
  ) {
    return this.sportsService.updateCustomSchema(schoolSportId, customFields);
  }
}
