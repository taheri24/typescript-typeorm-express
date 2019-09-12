import { crudUniversal, Router } from '../lib';
import listQuery from '../queries/post-list.sql'
import { PostEntity as Entity } from "../entities";
export const posts = () => crudUniversal(Router(), { Entity, listQuery });  