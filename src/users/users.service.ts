import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService) { }

  async create(createUserDto: CreateUserDto, schoolId: string) {
    const { tutors, studentProfile, tutorProfile, coachProfile, ...userData } = createUserDto;

    const exists = await this.prisma.userWithoutPassword.user.findFirst({
      where: {
        schoolId,
        OR: [
          { email: userData.email },
          { rut: userData.rut }
        ]
      }
    });

    if (exists) {
      throw new ConflictException('User already exists in this school');
    }

    const rounds = Number(this.configService.get<number>('SALT_ROUNDS', 12));
    const hashedPassword = await hashPassword(userData.password, rounds);

    return this.prisma.user.create({
      data: {
        ...userData,
        schoolId,
        password: hashedPassword,

        ...(tutors && {
          tutorsRelation: {
            create: tutors.map(tutor => ({
              tutorId: tutor.tutorId,
              relationType: tutor.relationType
            }))
          }
        }),

        ...(studentProfile && {
          studentProfile: {
            create: studentProfile
          }
        }),

        ...(tutorProfile && {
          tutorProfile: {
            create: tutorProfile
          }
        }),

        ...(coachProfile && {
          coachProfile: {
            create: coachProfile
          }
        })
      },
      include: {
        studentProfile: true,
        tutorProfile: true,
        coachProfile: true,
        tutorsRelation: {
          include: { tutor: true }
        }
      }
    });
  }

  async findAll(schoolId: string, pagination?: PaginationDto, search?: string, rolesQuery?: string) {
    const { page = 1, limit = 10 } = pagination || {};
    const skip = (page - 1) * limit;

    const whereClause: any = {
      schoolId,
      active: true,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { rut: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(rolesQuery && {
        roles: {
          hasSome: rolesQuery.split(',').map(r => r.toUpperCase())
        }
      })
    };

    const [data, total] = await Promise.all([
      this.prisma.userWithoutPassword.user.findMany({
        where: whereClause,
        skip,
        take: limit,
      }),
      this.prisma.userWithoutPassword.user.count({
        where: whereClause,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByEmail(email: string, schoolId: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
        schoolId,
        active: true,
      },
    });
  }

  async findOne(id: string, schoolId: string) {
    return this.prisma.userWithoutPassword.user.findFirst({
      where: { id, schoolId, active: true },
      include: {
        studentProfile: true,
        tutorProfile: true,
        coachProfile: true,
      }
    });
  }

  async update(id: string, dto: UpdateUserDto, schoolId: string) {
    const { studentProfile, tutorProfile, coachProfile, password, ...userData } = dto as any;

    // Hash password only if provided
    let hashedPassword: string | undefined;
    if (password && password.trim() !== '') {
      const rounds = Number(this.configService.get<number>('SALT_ROUNDS', 12));
      hashedPassword = await hashPassword(password, rounds);
    }

    return this.prisma.user.update({
      where: { id, schoolId },
      data: {
        ...userData,
        ...(hashedPassword && { password: hashedPassword }),

        ...(studentProfile && {
          studentProfile: {
            upsert: {
              create: studentProfile,
              update: studentProfile,
            }
          }
        }),

        ...(tutorProfile && {
          tutorProfile: {
            upsert: {
              create: tutorProfile,
              update: tutorProfile,
            }
          }
        }),

        ...(coachProfile && {
          coachProfile: {
            upsert: {
              create: coachProfile,
              update: coachProfile,
            }
          }
        }),
      },
      include: {
        studentProfile: true,
        tutorProfile: true,
        coachProfile: true,
      }
    });
  }

  async remove(id: string, schoolId: string) {
    return this.prisma.userWithoutPassword.user.update({
      where: {
        id,
        schoolId,
      },
      data: { active: false },
    });
  }
}

async function hashPassword(password: string, rounds: number): Promise<string> {
  try {
    const hashedPassword = await bcrypt.hash(password, rounds);
    return hashedPassword;
  } catch (error) {
    console.error('Bcrypt Error:', error);
    throw new InternalServerErrorException('Error when hashing password: ' + (error instanceof Error ? error.message : String(error)));
  }
}