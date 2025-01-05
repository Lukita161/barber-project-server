import bcrypt from 'bcrypt'
import { BarberI } from "../models/BarberSchema";

export const hashPassword = async(password: BarberI['password'])=> {
    try {
        const salt = 12
        const hashedPassword = await bcrypt.hash(password, salt)
        return hashedPassword
    } catch (error) {
        throw new Error('Ha ocurrido un error con tu contraseña')
    }
}