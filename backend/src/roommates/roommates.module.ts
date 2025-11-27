import { Module } from '@nestjs/common';
import { RoommatesService } from './roommates.service';
import { RoommatesController } from './roommates.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [RoommatesController],
    providers: [RoommatesService],
    exports: [RoommatesService],
})
export class RoommatesModule { }
