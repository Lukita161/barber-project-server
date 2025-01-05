import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken'
import dotenv from 'dotenv'
import { Barber } from "../models/BarberSchema"
import { BarberType } from "../types"

dotenv.config()
interface ExtendedJwtPayload extends JwtPayload {
    _id: string;
  }
  declare global {
    namespace Express {
      interface Request {
        barber?: BarberType
      }
    }
  }

export const isUserSignIn = async(req:Request, res:Response, next: NextFunction)=> {
    try {
        const token = req.headers.authorization
    if(!token) {
        res.status(401).send('No tienes permiso')
        return
    }
    const splitedToken = token.split(' ')[1]
    const decodedToken = jwt.verify(splitedToken, process.env.SECRET_WORD_JWT) as ExtendedJwtPayload
    if(!decodedToken) {
        res.status(404).send('El token de sesion a expirado')
        return
    }
    const barberExist = await Barber.findById(decodedToken._id).select('_id email name') 
    if(!barberExist) {
        res.status(401).send('El email no esta asociado a una cuenta')
        return
    }
    req.barber = {
        _id: barberExist?._id.toString(),
        email: barberExist?.email,
        name: barberExist?.name
    } as BarberType
    next()
    } catch (error) {
        res.status(404).send('Ha ocurrido un error al iniciar sesion')
        return
    }
}