import { Router, IRouterMatcher, RequestHandler } from 'express';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
export function posts() {
    return posts.router();
}
export namespace posts {
    @Entity('Posts')
    export class PostEntity {

        @PrimaryGeneratedColumn()
        id: number;

        @Column()
        title: string;

        @Column("text")
        text: string;

    }
    export function router() {
        const freshRouter = Router();
        freshRouter.get('/', readPosts);
        freshRouter.get('/:id', readPostById);
        freshRouter.post('/', createPost);
        freshRouter.put('/:id', updatePost);
        freshRouter.delete('/:id', deletePost);
        return freshRouter;
    }
    const createPost: RequestHandler = (req, res) => {

    }

    const readPosts: RequestHandler = (req, res) => {
        res.json({sdf:2});
    }
    const readPostById: RequestHandler = (req, res) => {

    }
    const updatePost: RequestHandler = (req, res) => {

    }
    const deletePost: RequestHandler = (req, res) => {

    }

}