import { Response } from 'express';
import * as core from "express";

declare global {
    export interface ReqHandler {
        (req: core.Request, res: Response & ResponseExtras, next: core.NextFunction): any;
    }
    export interface ResponseExtras {
        badRequestReply(errors: (string[] | string), statusCode?: number);
        reply<T>(json: T, statusCode?: number);
        nocache(): Response & ResponseExtras;
    }
}