import { routeTable, crudUniversal, Router, PostEntity as Entity, postListQuery as listQuery } from '@app-gallery';
export function posts() {
    routeTable.set('/posts', crudUniversal(Router(), { Entity, listQuery }));
}