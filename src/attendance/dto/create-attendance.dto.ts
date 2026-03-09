import { IsString, IsNotEmpty, IsDateString, IsArray, ValidateNested, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceRecordDto {
    @IsString()
    @IsNotEmpty()
    studentId: string;

    @IsEnum(AttendanceStatus)
    @IsNotEmpty()
    status: AttendanceStatus;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class CreateAttendanceSessionDto {
    @IsString()
    @IsNotEmpty()
    lessonId: string;

    @IsDateString()
    @IsNotEmpty()
    date: string; // ISO String (ej: 2026-03-07T00:00:00.000Z)

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttendanceRecordDto)
    records: AttendanceRecordDto[];
}
