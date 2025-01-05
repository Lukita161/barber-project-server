import connectDb from "./db"; import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import clientRouter from "./router/ClientRouter";
import BarberRouter from "./router/BarberRouter";
import { corsConfig } from "./config/cors";

dotenv.config()

connectDb()
const app = express()
app.use(express.json())
app.use(cors(corsConfig))

app.get('/', (req, res)=> {
    res.json({data: 'Hola'})
})
app.use(morgan('dev'))
app.use('/client', clientRouter)
app.use('/barber', BarberRouter)
export default app