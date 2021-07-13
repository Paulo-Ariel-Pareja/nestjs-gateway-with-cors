import { MessageDto } from "./message.dto";

export interface OwnerDto extends Document{
    readonly uuid: string;
    readonly messages?: MessageDto[];
}