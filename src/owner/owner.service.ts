import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types} from 'mongoose';
import { OwnerDto } from 'src/dto/owner.dto';
import { MessageData } from 'src/models/message.models';
import { Owner } from '../models/owner.models';

@Injectable()
export class OwnerService {
    constructor(@InjectModel('Owner') private readonly model: Model<Owner>) { }

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
        }
        if (dto.messages) {
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
        return left;
    }
}
