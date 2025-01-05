import mongoose, { Document, model, Schema, Types } from "mongoose";

export interface BarberI  extends Document {
    name: string,
    appointment: mongoose.Types.ObjectId[],
    phoneNumber: string,
    email: string,
    profileImage: string
    password: string
}

const BarberSchema : Schema = new Schema<BarberI>({
    name: {
        type: String,
        unique: true,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
    appointment: [
        {
            type: Types.ObjectId,
            ref: 'Client',
        }
    ],
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
    }
})

export const Barber = model('Barber', BarberSchema)