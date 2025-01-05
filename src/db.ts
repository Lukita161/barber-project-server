import moongose from 'mongoose'


export default async function connectDb (){
    try {
        await moongose.connect(process.env.MONGODB_URI)
        console.log('Connection succesfull')
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}