import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';

export class CreateClassDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    sportId: string;

    @IsString()
    @IsOptional()
    coachId?: string;

    @IsString()
    @IsOptional()
    schedule?: string;

    @IsInt()
    @Min(1)
    @IsOptional()
    maxStudents?: number;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}
