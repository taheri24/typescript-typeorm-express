import * as modules from './modules';
import { routeTable, Router } from '@app-gallery';
export default function api() {
    const apiRouter = Router();
    const moduleBootstarppers = [].concat(...Object.values(modules).map(
        mod => typeof mod == 'object' ? Object.values(mod) : [mod]))
    // bootstraping
    for (const moduleBootstarpper of moduleBootstarppers) {
        if (moduleBootstarpper instanceof Function)
            moduleBootstarpper()
    }
    for (const [routerPath, router] of routeTable.entries()) {
        apiRouter.use(routerPath, router);
    }
    return apiRouter;
}  