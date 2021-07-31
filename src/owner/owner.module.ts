import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../shared/shared.module';
import { OwnerSchema } from '../schemas/owner.schemas';
import { OwnerController } from './owner.controller';
import { OwnerGateway } from './owner.gateway';
import { OwnerService } from './owner.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Owner', schema: OwnerSchema }
        ]),
        SharedModule
    ],
    controllers: [OwnerController],
    providers: [OwnerService, OwnerGateway]
})
export class OwnerModule { }
