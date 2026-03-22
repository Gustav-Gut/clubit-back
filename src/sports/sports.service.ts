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

  async getAllSports() {
    return this.prisma.sport.findMany({
      select: {
        id: true,
        name: true,
        defaultFields: true
      }
    });
  }

  async associateSport(schoolId: string, sportId: string) {
    // Upsert to handle if it was previously deactivated
    return this.prisma.schoolSport.upsert({
      where: {
        schoolId_sportId: {
          schoolId,
          sportId
        }
      },
      update: {
        active: true
      },
      create: {
        schoolId,
        sportId
      }
    });
  }

  async dissociateSport(schoolSportId: string) {
    // Soft delete to keep history of past configurations
    return this.prisma.schoolSport.update({
      where: {
        id: schoolSportId
      },
      data: {
        active: false
      }
    });
  }
}
