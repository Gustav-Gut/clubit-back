import { Module } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { FacilitiesController } from './facilities.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [FacilitiesController],
    providers: [FacilitiesService],
    exports: [FacilitiesService],
})
export class FacilitiesModule { }
