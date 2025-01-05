import app from "./server"
import dotenv from 'dotenv'

dotenv.config()

const port = process.env.PORT || 4000 

app.listen(port, ()=> {
    console.log('Hola desde el puerto 4000')
})
