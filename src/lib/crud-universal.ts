import { Router, NextFunction } from "express";
import { getDefaultConnection, Query } from "../db";
import { Repository } from "typeorm";
import express = require("express");

export function crudUniversal<TE>(router: Router, opts?: crudUniversal.Options<TE>) {
    return crudUniversal.injectReqHandlers(router, opts);
}

export namespace crudUniversal {
    export interface Options<TE> {
        Entity?: new () => TE;
        injectMode?: 'readonly' | 'writeonly' | 'all';
        repo?: Repository<TE>
        listQuery?: IQuery;
        singleQuery?: IQuery;
    }
    export function injectReqHandlers<TE>(router: Router, options: Options<TE>) {
        const singleQuery = options.singleQuery || options.listQuery;
        const repo = options.repo || getDefaultConnection().getRepository(options.Entity);
        options = Object.assign({ repo, injectMode: 'all', singleQuery } as Partial<Options<any>>, options);
        router.get('/', readEntityList.bind(null, options));
        router.post('/', createEntity.bind(null, options));
        router.get('/:id', readSingleEntity.bind(null, options));
        router.put('/:id', updateEntity.bind(null, options));
        router.delete('/:id', readEntityList.bind(null, options));
        return router;
    }
    export interface ReqHandlerWithOptions {
        (opts: Options<any>, req: express.Request, res: express.Response & ResponseExtras, next: NextFunction): any;
    }
    async function query(sqlText: string, params: any[]): Promise<any[]> {
        const conn = getDefaultConnection();
        const result = await conn.query(sqlText, params) as any as any[];
        return result;
    }
    const readEntityList: ReqHandlerWithOptions = async (options, req, res) => {
        const { listQuery } = options;
        if (!listQuery) return res.reply('listQuery is not defined ', 500);
        const [sqlText, sqlParams] = listQuery.dynamicSelect(req.query);
        const rows = await query(sqlText, sqlParams);
        const sqlTextForCounting = await Query.getCountingQuery(sqlText);
        const [total] = (await query(Query.getCountingQuery(sqlTextForCounting), sqlParams)).map(r => r.total);
        res.json({ sqlText, total, rows });
    }
    const readSingleEntity: ReqHandlerWithOptions = async (options, req, res) => {
        const { singleQuery } = options;
        if (!singleQuery) return res.reply('singleQuery & listQuery is not defined ', 500);
        const [sqlText, sqlParams] = singleQuery.dynamicSelect(req.params);
        const [singleEntity] = await query(sqlText, sqlParams);
        if (!singleEntity) return res.reply({ errors: ['entity not found'] }, 404);
        res.json(singleEntity);
    }
    const createEntity: ReqHandlerWithOptions = async (options, req, res) => {
        const { repo } = options;
        const insertResult = await repo.insert(req.body);
        res.json(insertResult);
    }
    const updateEntity: ReqHandlerWithOptions = async (options, req, res) => {
        const { repo } = options;
        const updateResult = await repo.update(req.params.id,req.body);
        res.json(updateResult);
    }
    const deleteEnti: ReqHandlerWithOptions = async (options, req, res) => {
        const { repo } = options;
        const updateResult = await repo.update(req.params.id,req.body);
        res.json(updateResult);
    }
} 