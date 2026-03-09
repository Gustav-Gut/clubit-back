import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceSessionDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) { }

  /**
   * Registra la asistencia masiva de una clase en una fecha determinada.
   * Utiliza una transacción para asegurar que todos los registros se guarden o ninguno.
   */
  async submitAttendance(dto: CreateAttendanceSessionDto, coachId: string, schoolId: string) {
    // 1. Validar que la clase existe y pertenece a la escuela
    const lessonEntity = await this.prisma.lesson.findFirst({
      where: { id: dto.lessonId, schoolId }
    });

    if (!lessonEntity) {
      throw new NotFoundException('Class not found or does not belong to your school');
    }

    // Opcional: Validar que el coach que toma la asistencia sea el asignado a la clase (o un admin)
    // if (lessonEntity.coachId !== coachId) throw new ForbiddenException(...);

    // 2. Ejecutar Inserción Transaccional
    return this.prisma.$transaction(async (tx) => {
      // A. Crear la Sesión (La "Hoja de Asistencia")
      const session = await tx.attendanceSession.create({
        data: {
          lessonId: dto.lessonId,
          date: new Date(dto.date),
          coachId: coachId,
        }
      });

      // B. Insertar todos los registros individuales vinculados a esta sesión
      const recordsToInsert = dto.records.map(record => ({
        sessionId: session.id,
        studentId: record.studentId,
        status: record.status,
        notes: record.notes
      }));

      await tx.attendanceRecord.createMany({
        data: recordsToInsert,
      });

      return session;
    });
  }

  /**
   * Obtiene el historial de sesiones de asistencia de una clase.
   */
  async getClassAttendanceHistory(lessonId: string, schoolId: string) {
    return this.prisma.attendanceSession.findMany({
      where: {
        lessonId,
        lesson: { schoolId } // Seguridad: la lección debe ser del colegio del usuario
      },
      include: {
        coach: { select: { firstName: true, lastName: true } },
        _count: { select: { records: true } },
        records: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, rut: true } }
          }
        }
      },
      orderBy: { date: 'desc' }
    });
  }
  /**     * Obtiene el historial de asistencia de un estudiante específico en una clase.     */
  async getStudentAttendance(studentId: string, lessonId: string, schoolId: string) {
    return this.prisma.attendanceRecord.findMany({
      where: {
        studentId,
        session: {
          lessonId,
          lesson: { schoolId }
        }
      },
      include: {
        session: { select: { date: true, coach: { select: { firstName: true, lastName: true } } } }
      },
      orderBy: { session: { date: 'desc' } }
    });
  }
}
