import { Document } from "mongoose";
import { MessageData } from "./message.models";

export interface Owner extends Document{
    readonly uuid: string;
    readonly messages?: MessageData[];
}