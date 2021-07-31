import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OwnerDto } from '../dto/owner.dto';
import { MessageData } from '../models/message.models';
import { RedisPropagatorService } from '../shared/redis-propagator/redis-propagator.service';
import { SocketStateService } from '../shared/socket-state/socket-state.service';
import { Owner } from '../models/owner.models';

@Injectable()
export class OwnerService {
    constructor(
        @InjectModel('Owner') private readonly model: Model<Owner>,
        private readonly redisPropagator: RedisPropagatorService,
        private readonly socketState: SocketStateService
    ) { }

    async getMessagesActive(uuid): Promise<Owner> {
        const messages = await this.model.findOne({ uuid });
        return messages;
    }

    async getOneMessage(uuid, id): Promise<any> {
        const message = await this.model.aggregate(([
            { $match: { 'uuid': uuid, 'messages._id': Types.ObjectId(id) } },
            {
                $project: {
                    messages: {
                        $filter: {
                            input: '$messages',
                            as: 'message',
                            cond: { $eq: ['$$message._id', Types.ObjectId(id)] }
                        }
                    },
                    _id: 0
                }
            }
        ]));
        return message;
    }

    async create(dto: OwnerDto): Promise<Owner> {
        let owner: Owner;
        owner = await this.model.findOne({
            uuid: dto.uuid
        });
        if (!owner) {
            owner = new this.model(dto);
            return owner.save();
        } else if (dto.messages) {
            const newMessages: MessageData[] = dto.messages as MessageData[];
            owner.messages.push(...newMessages);
            return owner.save();
        }
        return owner
    }

    async removeMessage(uuid, id: string): Promise<Owner> {
        const data = { $pull: { messages: { _id: Types.ObjectId(id) } } }
        const left = await this.model.findOneAndUpdate(
            { uuid }, data,
            { new: true })

        const event = {
            event: 'msgToClient',
            data: left,
            sender: uuid
        };
        this.redisPropagator.emitToAllSocketForUser({
            ...event,
            socketId: null,
            userId: uuid,
            event: 'msgToClient',
        })
        return left;
    }

    async createWithNotification(dto: OwnerDto): Promise<Owner> {
        let owner: Owner;
        owner = await this.model.findOne({
            uuid: dto.uuid
        });
        if (!owner) {
            owner = new this.model(dto);
            owner.save();
        } else if (dto.messages) {
            const newMessages: MessageData[] = dto.messages as MessageData[];
            owner.messages.push(...newMessages);
            owner.save();
        }

        const event = {
            event: 'msgToClient',
            data: owner,
            sender: dto.uuid
        };
        this.redisPropagator.emitToAllSocketForUser({
            ...event,
            socketId: null,
            userId: dto.uuid,
            event: 'msgToClient',
        })

        return owner
    }

    async sendNotificationToAllNotPersist(dto: OwnerDto): Promise<Owner> {
        const data = {
            "uuid": "usuarioX",
            "messages": [
                {
                    "message": "esto es un broadcast",
                }
            ]
        }
        const sockets = await this.socketState.get(dto.uuid);
        if (sockets.length > 0) {
            const event = {
                event: 'msgToClient',
                data,
                sender: dto.uuid
            };
            await this.redisPropagator.emitToAll({
                ...event,
                event: 'msgToClient',
            })
        }
        return null
    }
}
