import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export const isNotEmpty = (req: Request, res: Response, next: NextFunction): void=> {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() }); // No retornamos aquí
        return;
    }
    next()
}