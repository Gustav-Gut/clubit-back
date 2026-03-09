import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacilitiesService {
    constructor(private prisma: PrismaService) { }

    async create(createFacilityDto: CreateFacilityDto, schoolId: string) {
        return this.prisma.facility.create({
            data: {
                ...createFacilityDto,
                schoolId,
            },
        });
    }

    async findAll(schoolId: string) {
        return this.prisma.facility.findMany({
            where: { schoolId },
            include: {
                _count: { select: { lessons: true } },
            },
        });
    }

    async findOne(id: string, schoolId: string) {
        const facility = await this.prisma.facility.findFirst({
            where: { id, schoolId },
            include: {
                lessons: {
                    include: {
                        sport: true,
                        coach: { select: { firstName: true, lastName: true } },
                    },
                },
            },
        });

        if (!facility) throw new NotFoundException('Facility not found');
        return facility;
    }

    async update(id: string, updateFacilityDto: any, schoolId: string) {
        return this.prisma.facility.update({
            where: { id, schoolId },
            data: updateFacilityDto,
        });
    }

    async remove(id: string, schoolId: string) {
        // Podríamos implementar borrado lógico si fuera necesario
        return this.prisma.facility.delete({
            where: { id, schoolId },
        });
    }

    async getCalendar(schoolId: string) {
        // Cruza las clases con las canchas para armar un calendario
        const lessons = await this.prisma.lesson.findMany({
            where: { schoolId, active: true },
            include: {
                facility: true,
                sport: true,
                coach: { select: { firstName: true, lastName: true } },
            },
        });

        return lessons.map((c) => ({
            id: c.id,
            title: `${c.name} (${c.sport.name})`,
            coach: c.coach ? `${c.coach.firstName} ${c.coach.lastName}` : 'Sin profesor',
            facility: c.facility?.name || 'Sin cancha asignada',
            dayOfWeek: c.dayOfWeek,
            startTime: c.startTime,
            endTime: c.endTime,
            facilityId: c.facilityId,
        }));
    }
}
