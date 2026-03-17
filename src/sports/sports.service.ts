import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SportsService {
  constructor(private prisma: PrismaService) { }

  async getEffectiveSchema(schoolId: string) {
    const schoolSports = await this.prisma.schoolSport.findMany({
      where: {
        schoolId,
        active: true
      },
      include: {
        sport: true
      }
    });

    return schoolSports.map(ss => {
      const effectiveSchema = ss.customFields || ss.sport.defaultFields;

      return {
        id: ss.id,
        sportName: ss.sport.name,
        schema: effectiveSchema || { student: [], coach: [] }
      };
    });
  }

  async updateCustomSchema(schoolSportId: string, customFields: any) {
    return this.prisma.schoolSport.update({
      where: {
        id: schoolSportId
      },
      data: {
        customFields
      }
    });
  }
}
