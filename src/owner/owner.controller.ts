import {
    Controller,
    Body,
    Get,
    Post,
    Delete,
    Param,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { OwnerDto } from '../dto/owner.dto';
import { OwnerService } from './owner.service';

@Controller('owner')
export class OwnerController {
    constructor(
        private service: OwnerService
    ) { }

    @Post('/')
    async create(@Body() dto: OwnerDto) {
        try {
            const owner = await this.service.create(dto);
            return {
                status: 'ok',
                owner
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get('/:uuid')
    async getMessages(@Param('uuid') uuid) {
        try {
            const owner = await this.service.getMessagesActive(uuid);
            return {
                status: 'ok',
                qty: owner.messages.length,
                owner
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get('/:uuid/:id')
    async getMessage(@Param('uuid') uuid, @Param('id') id) {
        try {
            const result = await this.service.getOneMessage(uuid, id);
            if (result.length === 0) {
                throw new NotFoundException();
            }
            return {
                status: 'ok',
                message: result[0].messages
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Delete('/:uuid/:id')
    async deleteMessage(@Param('uuid') uuid, @Param('id') id) {
        try {
            const owner = await this.service.removeMessage(uuid, id);
            return {
                status: 'ok',
                qty: owner.messages.length,
                owner
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
