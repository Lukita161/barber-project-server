import { body, param } from 'express-validator'

import { ClientController } from '../controllers/ClientController';
import { Router } from 'express';
import { isNotEmpty } from '../middleware/isNotEmpty';
import { status } from '../models/ClientSchema';

const clientRouter = Router()

clientRouter.post('/', 
    body('fullName').notEmpty().withMessage('Este campo es necesario'),
    body('phone').notEmpty().withMessage('Debes ingresar un correo electrónico válido'),
    body('date').notEmpty().withMessage('La fecha no puede ir vacia'),
    body('barber').notEmpty().withMessage('El barbero es necesario'),
    body('hour').isString().notEmpty().withMessage('La hora es necesaria'),
    isNotEmpty,
    ClientController.createClient
)

clientRouter.get('/',
    ClientController.getAllClients
)

clientRouter.patch('/client/:id',
    param('id').isMongoId().withMessage('El id es invalido'),
    body('status').custom(value => {
        if (!status.includes(value)) {
        throw new Error('El status es invalido') 
        }
        return true
    }),
    isNotEmpty,
    ClientController.changeStatusClient
)

clientRouter.get('/client/count',
    ClientController.countAllClients
)
clientRouter.post('/clients/months/count',
    body('month').isEmpty().withMessage('Falta el mes'),
    ClientController.getClientNumberForMonths
)
clientRouter.get('/clients/months',
    ClientController.getClientsForCurrentMonth)
clientRouter.get('/clients/months/count',
    ClientController.getStatsForAllMonths
)

clientRouter.delete('/client/delete/:id',
    param('id').isMongoId().withMessage('El id es invalido'),
    isNotEmpty,
    ClientController.deleteClient
)

export default clientRouter