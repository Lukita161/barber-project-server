import { ObjectId } from "mongodb";
import { Document, Types } from "mongoose";

interface Appointment {
    _id: ObjectId;
    fullName: string;
    date: Date;
    hour: string;
    phone: string;
    status: string;
    barber: ObjectId;
    __v: number;
}

export interface Client {
    _id: ObjectId;
    appointment: Appointment[];
}

export type BarberType = {
    _id: string,
    name: string,
    email: string
}

export type AppointmentsInfoType = Document & {
    _id: string,
    fullName: string,
    date: string,
    hour: string,
    phone: string,
    status: string,
    barber: Types.ObjectId
    __v: number
}