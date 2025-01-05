import { Router } from "express";
import { body, param } from "express-validator";
import { isNotEmpty } from "../middleware/isNotEmpty";
import { BarberController } from "../controllers/BarberController";
import { isUserSignIn } from "../middleware/isUserSignIn";

const BarberRouter = Router()

BarberRouter.post('/', 
    body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
    body('phoneNumber').notEmpty().withMessage('El numero de telefono es obligatorio'),
    body('email').notEmpty().withMessage('El email no puede ir vacio').isEmail().withMessage('Email no valido'),
    body('password').notEmpty().withMessage('La contraseña no es valida'),
    isNotEmpty,
    BarberController.createBarber
)
BarberRouter.post('/logIn',
    body('email').isEmail().withMessage('El email no es valido').notEmpty().withMessage('No puede estar vacio'),
    body('password').isLength({min: 8}).withMessage('La contraseña es muy corta'),
    isNotEmpty,
    BarberController.logIn
)
BarberRouter.get('/isBarber', isUserSignIn, BarberController.isUserSigned)
BarberRouter.get('/',
    BarberController.getAllBarbers
)
BarberRouter.use(isUserSignIn)

BarberRouter.get('/barbers/:barberId',
    param('barberId').isMongoId().withMessage('Parametro no valido').notEmpty().withMessage("El parametro es obligatorio"),
    isNotEmpty,
    BarberController.getBarberById
)

BarberRouter.get('/appointments/:barberId',
    param('barberId').isMongoId().withMessage('No es valido ese parametro'),
    isNotEmpty,
    BarberController.getAppointmentsInfo
)
BarberRouter.get('/appointment/:barberId/:appointmentId',
    param('barberId').isMongoId().withMessage('No es valido ese parametro'),
    param('appointmentId').isMongoId().withMessage('No es valido ese parametro'),
    isNotEmpty,
    BarberController.getAppointmentInfo
)
BarberRouter.get('/:barberId/appointment/count',
    param('barberId').isMongoId().withMessage('No es valido ese parametro'),
    isNotEmpty,
    BarberController.countAppointments
)
BarberRouter.get('/barbers/allBarbers/info', BarberController.getBarbersAndCountAppointments)

BarberRouter.delete('/delete/:barberId', 
    param('barberId').isMongoId().notEmpty().withMessage('Parametro invalido'),
    isNotEmpty,
    BarberController.deleteBarber
)
BarberRouter.get('/barbers/appointments/:barberId/count',
    param('barberId').isMongoId().withMessage('No es valido ese parametro'),
    isNotEmpty,
    BarberController.countAppointmentsForBarberByMonths
)
BarberRouter.get('/barbers/appointments/:barberId/day',
    param('barberId').isMongoId().withMessage('No es valido ese parametro'),
    isNotEmpty,
    BarberController.getAppointmentsInfoByDate
)
export default BarberRouter