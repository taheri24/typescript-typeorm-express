import * as routers from './routers'; 
import { Router } from 'express';
export default function api(){
    const apiRouter=Router();
    apiRouter.use('/posts',routers.posts());
    return apiRouter;
}  