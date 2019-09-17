/// <reference path="../../types/index.d.ts" />

import { ServerResponse } from 'http';
import { Router } from 'express';
export * from './crud-universal';
export { Router } from 'express';
export const routeTable = new Map<string, Router>();

Object.assign(ServerResponse.prototype, {
    badRequestReply(errors, statusCode = 400) {
        this.reply({ errors }, statusCode);
    },
    reply(json, statusCode = 200) {
        this.status(statusCode).send(json);
    },
    nocache() {
        this.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        this.header('Expires', '-1');
        this.header('Pragma', 'no-cache');
        return this;
    }
});
