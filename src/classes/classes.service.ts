import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollStudentDto } from './dto/enroll-student.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) { }

  async create(createClassDto: CreateClassDto, schoolId: string) {
    return this.prisma.class.create({
      data: {
        ...createClassDto,
        schoolId,
      },
    });
  }

  async findAll(schoolId: string) {
    return this.prisma.class.findMany({
      where: { schoolId },
      include: {
        sport: true,
        coach: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { enrollments: true } }
      }
    });
  }

  async findOne(id: string, schoolId: string) {
    const classEntity = await this.prisma.class.findFirst({
      where: { id, schoolId },
      include: {
        sport: true,
        coach: { select: { id: true, firstName: true, lastName: true } },
        enrollments: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, rut: true } }
          }
        }
      }
    });

    if (!classEntity) throw new NotFoundException('Class not found');
    return classEntity;
  }

  async update(id: string, updateClassDto: any, schoolId: string) {
    return this.prisma.class.update({
      where: { id, schoolId },
      data: updateClassDto,
    });
  }

  async remove(id: string, schoolId: string) {
    return this.prisma.class.update({
      where: { id, schoolId },
      data: { active: false },
    });
  }

  async enrollStudent(classId: string, enrollDto: EnrollStudentDto, schoolId: string) {
    // 1. Verificar que la clase existe y pertenece al colegio
    const classEntity = await this.prisma.class.findFirst({
      where: { id: classId, schoolId },
      include: { _count: { select: { enrollments: true } } }
    });

    if (!classEntity) throw new NotFoundException('Class not found');

    // 2. Validar límite de alumnos si existe
    if (classEntity.maxStudents && classEntity._count.enrollments >= classEntity.maxStudents) {
      throw new BadRequestException(`Class has reached its maximum capacity of ${classEntity.maxStudents} students`);
    }

    // 3. Inscribir alumno (Prisma lanzará error si ya está inscrito por el @@unique)
    try {
      return await this.prisma.classEnrollment.create({
        data: {
          classId,
          studentId: enrollDto.studentId
        }
      });
    } catch (error) {
      // P2002 es el código de Prisma para violación de variable única (@@unique[classId, studentId])
      if (error.code === 'P2002') {
        throw new ConflictException('Student is already enrolled in this class');
      }
      throw error;
    }
  }

  async unenrollStudent(classId: string, studentId: string, schoolId: string) {
    const enrollment = await this.prisma.classEnrollment.findFirst({
      where: {
        classId,
        studentId,
        class: { schoolId } // Asegurar que el colegio de la clase es correcto
      }
    });

    if (!enrollment) throw new NotFoundException('Enrollment not found');

    return this.prisma.classEnrollment.delete({
      where: { id: enrollment.id }
    });
  }
}
