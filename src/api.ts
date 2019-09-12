import * as routers from './routers';
import { Router } from 'express';
export default function api() {
    const apiRouter = Router();
    for (const [prefix, router] of Object.entries(routers)) {
        if (router instanceof Function)
            apiRouter.use(`/${prefix}`, router());
    }
    return apiRouter;
}  