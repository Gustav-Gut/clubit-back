import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ClassesService } from '../src/classes/classes.service';
import { AttendanceService } from '../src/attendance/attendance.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const classesService = app.get(ClassesService);
    const attendanceService = app.get(AttendanceService);
    const prismaService = app.get(PrismaService);

    try {
        console.log('--- 1. Preparando Entorno ---');

        // Obtener un colegio
        const school = await prismaService.school.findFirst();
        if (!school) throw new Error('No hay colegios en la BD');

        // Obtener "Ashim" (el estudiante de la prueba anterior)
        const student = await prismaService.user.findFirst({
            where: { rut: '19340717-K' }
        });
        if (!student) throw new Error('Falta el estudiante de prueba');

        // Crear un deporte temporal si no existe
        let sport = await prismaService.sport.findFirst({ where: { name: 'Basketball' } });
        if (!sport) {
            sport = await prismaService.sport.create({
                data: { name: 'Basketball', defaultFields: {} }
            });
        }

        console.log('\n--- 2. Creando una Clase ---');
        const newClass = await classesService.create({
            name: 'Sub-15 Avanzado Basket',
            sportId: sport.id,
            maxStudents: 15,
            schedule: 'Lunes y Miércoles 18:00'
        }, school.id);
        console.log(`Clase creada: ${newClass.name} (Max Cupos: ${newClass.maxStudents})`);

        console.log('\n--- 3. Inscribiendo Estudiante a la Clase ---');
        const enrollment = await classesService.enrollStudent(newClass.id, { studentId: student.id }, school.id);
        console.log(`Estudiante ${student.firstName} inscrito exitosamente! Enrollment ID: ${enrollment.id}`);

        console.log('\n--- 4. Pasando la Asistencia (Simulación de la App del Coach) ---');
        // Supongamos que Ashim llegó tarde
        const attendanceRecord = {
            studentId: student.id,
            status: AttendanceStatus.LATE,
            notes: "Llegó al segundo cuarto del entrenamiento"
        };

        const session = await attendanceService.submitAttendance({
            classId: newClass.id,
            date: new Date().toISOString(),
            records: [attendanceRecord]
        }, student.id, school.id); // Simulando que student.id es el admin/coach para no crear otro usuario

        console.log(`✅ Asistencia tomada exitosamente.`);
        console.log(`Session ID generada: ${session.id}`);

        console.log('\n--- 5. Verificando Historial de Ashim ---');
        const history = await attendanceService.getStudentAttendance(student.id, newClass.id, school.id);
        console.dir(history, { depth: null });

    } catch (error) {
        console.error('\n❌ Error en la simulación:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
