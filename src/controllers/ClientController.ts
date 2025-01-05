import { Request, Response } from "express"
import { Client } from "../models/ClientSchema"
import { Barber, BarberI } from "../models/BarberSchema"

export class ClientController {
    static createClient = async(req:Request, res: Response)=> {
        const { fullName, date, phone, barber, hour } = req.body
        const client = new Client({ fullName, date, phone, hour })
        const selectedBarber = await Barber.findOne({name: barber}) as BarberI
        if(!selectedBarber) {
            res.status(404).json({message: "Barber not found"})
            return
        }
        client.barber = selectedBarber.id
        selectedBarber.appointment.push(client.id)
        await selectedBarber.save()
        await client.save()
        res.send('Cliente creado correctamente')
    }
    static getAllClients = async(req: Request, res:Response)=> {
        const clients = await Client.find()
        res.json(clients)
    }
    static changeStatusClient = async(req:Request, res:Response)=> {
        const { id } = req.params
        const { status } = req.body
        const client = await Client.findById(id)
        if(!client) {
            res.status(404).json({message: 'No se encontro al cliente'})
        }
        client.status = status
        await client.save()
        res.json({ message: "Client status updated successfully" })
    }
    static countAllClients = async(req:Request, res:Response)=> {
        try {
            const count = await Client.countDocuments()
            if(!count) {
                res.status(404).json("No hay clientes registrados")
            }
            res.json({ count })
        } catch (error) {
            throw new Error(error)
        }
    }
    static getClientsForCurrentMonth = async(req:Request, res:Response)=> { 
        const currentMonth = new Date().getMonth() + 1
        const clients = await Client.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [{ $month: { $dateFromString: { dateString: "$date", format: "%d/%m/%Y" } } }, currentMonth] // Convierte el string a Date y filtra por el mes
                    }
                }
            }
,])
            const fullClientInfo = await Client.populate(clients, { path: "barber", select: 'name profileImage' })
            res.json(fullClientInfo)
    }
    static getClientNumberForMonths = async(req: Request, res:Response) => {
        const { month } = req.body
        try {
            const clients = await Client.aggregate([
                {
                    $match: {
                        $expr: {
                            $eq: [{ $month: { $dateFromString: { dateString: "$date", format: "%d/%m/%Y" } } }, month] // Convierte el string a Date y filtra por el mes
                        }
                    }
                },
                {
                    $group: {
                        _id: null, // Agrupa todos los resultados
                        totalClients: { $count: {} } // Cuenta el total de clientes
                    }
                }
    
            ]);
    
            if (clients.length === 0) {
                res.json({ totalClients: 0 }); // Si no hay clientes, devuelve 0
                return 
            }
    
            res.json(clients[0]);
        } catch (error) {
            throw new Error(error)
        }
    }
    static getStatsForAllMonths = async(req:Request, res:Response)=> {
        try {
            const clients = await Client.aggregate([
                {
                    $addFields: {
                        // Convertir la cadena de fecha a un objeto de fecha
                        dateObject: {
                            $dateFromString: {
                                dateString: "$date",
                                format: "%d/%m/%Y" // Especifica el formato de la fecha
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m", date: "$dateObject" } // Agrupar por mes
                        },
                        count: { $sum: 1 } // Contar el número de clientes por mes
                    }
                },
                {
                    $sort: { _id: 1 } // Ordenar los resultados por mes
                }
            ]);
            res.status(200).json(clients)
        } catch (error) {
            throw new Error(error)
        }
    }
    static deleteClient = async(req:Request, res: Response) => {
        const { id } = req.params
        const client = await Client.findById(id)
        if(!client) {
            res.status(404).json({message: 'No se encontro al cliente'})
            return
        }
        const clientBarber = await Barber.findById(client.barber) as BarberI
        clientBarber.appointment = clientBarber.appointment.filter(appointment => appointment.toString() !== client.id)
        await Promise.allSettled([clientBarber.save(), client.deleteOne()])
        res.send('Cliente eliminado correctamente')
    }
}