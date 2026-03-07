import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);
    const prismaService = app.get(PrismaService);

    try {
        console.log('--- Buscando o Creando Colegio de Prueba ---');
        let school = await prismaService.school.findFirst();
        if (!school) {
            school = await prismaService.school.create({
                data: {
                    name: 'Test Academy',
                    slug: 'test-academy-' + Date.now(),
                    address: '123 Test St'
                }
            });
            console.log('Colegio creado:', school.id);
        } else {
            console.log('Usando colegio existente:', school.id);
        }

        console.log('\n--- Insertando Estudiante con Ficha Dinámica ---');

        // Limpiar si el usuario ya existe por rut o email
        await prismaService.user.deleteMany({
            where: { rut: '19340717-K' }
        });

        const studentData = {
            firstName: "Ashim",
            lastName: "Elgueta",
            rut: "19340717-K",
            email: "ashim.test@sportivo.com",
            password: "securepassword123",
            role: "STUDENT" as any,
            studentProfile: {
                height: 198,
                sportData: {
                    envergadura: 200,
                    saltoVertical: 80,
                    posicion: "Alero"
                }
            }
        };

        const result = await usersService.create(studentData as any, school.id);
        console.log('\n✅ ¡Usuario Creado Exitosamente!\n');
        console.dir(result, { depth: null });

    } catch (error) {
        console.error('\n❌ Error durante la creación:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
