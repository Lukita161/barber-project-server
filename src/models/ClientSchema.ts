import mongoose, { Schema, Types } from "mongoose";

export const status = ['pending', 'completed']
export type StatusType = typeof status[number]
export interface ClientI {
    fullName: string;
    date: string,
    phone: string;
    barber: Types.ObjectId
    hour: string,
    status: StatusType
}
const ClientSchema : Schema = new mongoose.Schema<ClientI>({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String,
        required: true,
    },
    hour: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: status,
        default: 'pending'
    },
    barber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barber',
        required: true
    }
})

export const Client = mongoose.model<ClientI>('Client', ClientSchema)