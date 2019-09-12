/// <reference path="../../types/index.d.ts" />

import { ServerResponse } from 'http';

export * from './crud-universal';
export { Router } from 'express';
ServerResponse.prototype['badRequestReply'] = function (errors, statusCode = 400) {
    this.status(statusCode).send({ errors });
}
ServerResponse.prototype['reply'] = function (json, statusCode = 200) {
    this.status(statusCode).send(json);
}
ServerResponse.prototype['nocache'] = function () {
    this.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    this.header('Expires', '-1');
    this.header('Pragma', 'no-cache');
    return this;
}