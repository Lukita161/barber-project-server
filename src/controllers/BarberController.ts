import { Request, Response } from "express"
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { Barber, BarberI } from "../models/BarberSchema"
import { hashPassword } from "../utils/hashPassword"
import { comparePassword } from "../utils/comparePassword"
import { Client } from "../models/ClientSchema"
import { AppointmentsInfoType } from "../types"
dotenv.config()
export class BarberController {
    static createBarber = async(req: Request, res:Response)=> {
        try {
            const { name, phoneNumber, email, password, profileImage } = req.body
            const barber = new Barber({ name, phoneNumber, email, password, profileImage })
            barber.password = await hashPassword(password)
            await barber.save()
            res.status(201).send('Barbero creado correctamente')
        } catch (error) {
            throw new Error(error)
        }
    }
    static logIn = async(req: Request, res: Response)=> {
        try {
            const { email, password } = req.body
            const barber = await Barber.findOne({ email }).select('_id password') as BarberI
            if (!barber) {
                res.status(404).json({message: 'Email not found'})
            }
            const isPasswordMatch = await comparePassword(password, barber.password)
            if(!isPasswordMatch) {
                res.status(404).json({message: 'Tu contraseña no coincide'})
                return
            }
            const token = jwt.sign({_id: barber._id}, process.env.SECRET_WORD_JWT)
            res.status(200).send(token)
        } catch (error) {
            throw new Error(error)
        }
    }
    static getAllBarbers = async(req: Request, res:Response)=> {
        try {
            const barbers = await Barber.find().select('_id name phoneNumber email profileImage')
            if(!barbers){
                res.status(404).json('Ha ocurrido un error')
                return 
            }
            res.status(200).json(barbers)
        } catch (error) {
            throw new Error(error)
        }
    }
    static getBarbersAndCountAppointments = async(req:Request, res:Response) => {
        try {
            const barbers = await Barber.find().select('_id name phoneNumber email profileImage appointment')
            if(!barbers){
                res.status(404).json('Ha ocurrido un error')
                return 
            }
            res.status(200).json(barbers)

        } catch (error) {
            throw new Error(error)
        }
    }
    static getBarberById = async(req:Request, res:Response) => {
        try {
            const {barberId} = req.params
            const barber = await Barber.findById(barberId).select('_id name phoneNumber appointment email profileImage')
            if(!barber) {
                res.status(404).json('Barbero no encontrado')
                return
            }
            res.status(200).json(barber)
        } catch (error) {
            res.status(500).send('Error en el servidor')
        }
    }
    static getAppointmentsInfo = async(req: Request, res:Response) => {
        try{
            const { barberId } = req.params
            const barber = await Barber.findById(barberId).select('appointment').populate('appointment')
            if(!barber){
                res.status(404).json('Ha ocurrido un error')
                return
            }
            res.json(barber)
        } catch(error) {
            throw new Error(error)
        }
    }
    static getAppointmentInfo = async(req:Request, res:Response)=> {
        try{
            const { barberId, appointmentId } = req.params
            const barber = await Barber.findById(barberId).select('appointment').populate('appointment')
            if(!barber){
                res.status(404).json('Ha ocurrido un error')
                return
            }
            if (!Array.isArray(barber.appointment)) {
                res.status(404).json('No appointments found');
                return;
            }
            const appointment = barber.appointment.find(value => {
                return value._id.toString() === appointmentId;
            });
            res.json(appointment)
        } catch(error) {
            throw new Error(error)
        }
    }
    static getAppointmentsInfoByDate = async(req: Request, res:Response) => {
        const { barberId } = req.params
        const date = new Date()
        const searchedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
        const clients = await Client.find({ barber: barberId, date: searchedDate.toString() }).select('_id fullName phone hour status').sort({hour: 'asc'})
        if (clients.length === 0) {
            res.json([]);
            return
        }
        res.json(clients)
    }
    static countAppointments = async(req: Request, res:Response) => {
        try {
            const { barberId } = req.params
            const count = await Barber.findById(barberId).select('appointment').populate('appointment')
            if(!count) {
                res.status(404).json('No appointments found');
                return 
            }
            res.json(count)
        } catch (error) {
            throw new Error(error)
        }
    }
    static deleteBarber = async(req:Request, res:Response)=> {
        try {
            const {barberId} = req.params
            const barber = await Barber.findById(barberId)
            if(!barber) {
                res.status(404).json('No existe ese usuario')
                return
            }
            const clients = await Client.find({barber: barberId})
            if(!clients) {
                res.status(404).json('No hay clientes asignados')
            }
            clients.filter(async(client) => {
                if(client.barber.toString() === barberId.toString()) {
                    await client.deleteOne()
                }
            })
            await barber.deleteOne()
            res.send('Barbero eliminado')
        } catch (error) {
            res.status(500).send('Hubo un error, intentalo nuevamente')
        }
    }
    static countAppointmentsForBarberByMonths = async(req:Request, res:Response) => {
        const {barberId} = req.params
        const barber = await Barber.findById(barberId).populate('appointment');

        if (!barber) {
            res.status(404).json({ message: 'Barber not found' });
            return
        }

        // Extraemos las citas del barbero
        const appointments = barber.appointment as AppointmentsInfoType[]
        // Si no hay citas, devolvemos un arreglo vacío
        if(appointments.length === 0) {
            res.status(404).send('No hay clientes asignados')
            return
        }

        // Ahora, realizamos la agregación para contar las citas por mes
        const appointmentCounts = appointments.reduce((acc, appointment) => {
            const [day, month, year] = appointment.date.split('/'); // Dividir la fecha
            const date = new Date(`${year}-${month}-${day}`); // Crear un objeto Date en formato "yyyy-mm-dd"
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!acc[monthYear]) {
                acc[monthYear] = 0;
            }
            acc[monthYear]++;
            return acc;
        }, {});

        // Convertir el objeto a un arreglo para la respuesta
        const result = Object.entries(appointmentCounts).map(([month, count]) => ({ month, count }));
        res.json(result);
        
    }
    static isUserSigned = async(req: Request, res: Response)=> {
        const {barber} = req
        const barberSigned = await Barber.findById(barber._id).select('_id email name')
        if(!barberSigned) {
            res.status(404).json({error: 'Parece que no estas logueado'})
    }
    res.json(barberSigned)
}

}