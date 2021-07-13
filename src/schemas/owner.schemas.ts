import { Schema } from 'mongoose';

const message = {
    message: { type: String, required: true },
    callback: { type: String },
    createdAt: {
        type: Date,
        default: Date.now
    }
}

export const OwnerSchema = new Schema({
    uuid:{ type: String, required: true },
    messages: { type: [message], default: [] },
    createdAt: {
        type: Date,
        default: Date.now
    }
});