/// <reference path="../../types/index.d.ts" />

import { Router, IRouterMatcher, RequestHandler, Request, Response } from 'express';
import captchapng from 'captchapng';
import sha1 from 'sha1';

import { EventEmitter } from 'events';
export function auth() {
    return auth.router();
}
export namespace auth {
    const tokenSalt = `1s@adsxsff2131231231s(*&^)>dfscXse23`;
    interface LoginModel {
        baseURL: string;
        sessionExpireAt: number;
        username: string;
        password: string;
        captchaUser: string;
        captchaSystemValue: string;
    }

    export const dataEvents = new EventEmitter();
    const allRoleRevisions: { [roleId: number]: number } = { 1: 1, 2: 1 };
    const allUserRoles: { [userId: number]: number[] } = { 1: [1, 2] };
    export function router() {
        const freshRouter = Router();
        freshRouter.post('/login', login);
        freshRouter.get('/time', time);
        freshRouter.get('/captcha', generateCaptcha);

        return freshRouter;
    }
    export function generateTokenHash(userId, sessionExpireAt) {
        const currentUserRoles = allUserRoles[userId];
        if (!currentUserRoles) return;
        const currentUserRoleRevisions = currentUserRoles.map(roleId => allRoleRevisions[roleId]);
        return sha1(
            tokenSalt + ([sessionExpireAt, userId, ...currentUserRoles, ...currentUserRoleRevisions].join('')) + tokenSalt);

    }
    function generateHashForCaptcha(imageNumber, expireAt) {
        return sha1(imageNumber + sha1(expireAt + tokenSalt + expireAt) + sha1(expireAt + '' + imageNumber));
    }
    const generateCaptcha: ReqHandler = (req, res) => {

        const expireAt = +new Date() + (60 * 15 * 1000); // 15 minutes
        const imageNumber = Math.floor(Math.random() * 9000 + 1000);
        const hash = generateHashForCaptcha(imageNumber, expireAt);
        var p: any = new captchapng(180, 50, imageNumber); // width,height,numeric captcha

        p.color(255, 255, 255, 255);  // First color: background (red, green, blue, alpha)
        p.color(0, 0, 0, 255); // Second color: paint (red, green, blue, alpha)
        var img = p.getBase64();
        var imgbase64 = Buffer.from(img, 'base64');
        res.nocache().json({ captchaSystemValue: expireAt + '-' + hash, imageBase64: 'data:image/png;base64, ' + (Buffer.from(imgbase64).toString('base64')) });
    }
    export const time: ReqHandler = (req, res) => {
        res.nocache().json({ time: +new Date() });
    }
    function checkExpireAt(value: number, maxTTL = 15 * 60 * 1000) {
        const now = +new Date();
        return value && (value >= now) && (value < now + maxTTL);
    }
    const maxSessionTTL = 31 * 24 * 3600 * 1000;
    let captchaSystemValues: string[] = [];
    export const login: ReqHandler = (req, res) => {
        const { redirectMode } = req.query;
        const { sessionExpireAt, captchaSystemValue, captchaUser, baseURL, ...user } = req.body as LoginModel;
        function badRequest(error) {
            if (baseURL && redirectMode) return res.redirect(baseURL + `#login-${error}`);
            res.badRequestReply(error);
        }
        if (redirectMode) {
            if (!baseURL || !/^https?\:/.test(baseURL)) return badRequest('invalid-baseURL');
        }
        if (!checkExpireAt(sessionExpireAt, maxSessionTTL))
            return badRequest('invalid-sessionExpireAt');
        if (typeof captchaSystemValue != 'string' || !captchaSystemValue.includes('-')) return badRequest('captcha-format');
        const [captchaExpireAt, captchaHash] = captchaSystemValue.split('-');

        if (!checkExpireAt(+captchaExpireAt))
            return badRequest('captcha-expireAt');
        if (generateHashForCaptcha(captchaUser, captchaExpireAt) != captchaHash)
            return badRequest('captcha-user');

        const userId = 1;
        const hash = generateTokenHash(userId, sessionExpireAt);
        const token = [userId, sessionExpireAt, hash].join('-');
        if (captchaSystemValues.includes(captchaSystemValue))
            return badRequest('warning-captchaSystemValue');
        captchaSystemValues.push(captchaSystemValue);
        if (captchaSystemValues.length > 1000) cleanCaptchaSystemValues();
        if (redirectMode)
            res.redirect(baseURL + '#setAccessToken' + token, 302);
        else res.json({ token });
    }
    export const middleWare: ReqHandler = (req, res, next) => {
        const take401 = (error: string) => res.status(401).send({ errors: [error] });
        if (req.body.currentUserId) return take401('currentUserId-abuse');
        if (req.path.includes('/auth/')) return next();
        const { authorization } = req.headers;
        if (!authorization) return take401('authorization-required');
        if (!/^Bearer[ ][0-9]+\-[0-9]+\-[0-9a-zA-Z]+$/.test(authorization)) return take401('authorization-format');
        const accessToken = authorization.replace('Bearer ', '');
        const [currentUserId, sessionExpireAt, hash] = accessToken.split('-');
        if (!checkExpireAt(+sessionExpireAt)) return take401('session-expired');
        if (!hash || generateTokenHash(currentUserId, sessionExpireAt) != hash) return take401('warning-verify-hash');
        Object.assign(req.body, { currentUserId });
        next();
    }
    function cleanCaptchaSystemValues() {
        const now = +new Date();
        captchaSystemValues = captchaSystemValues.filter(c => (+c.split('-')[0]) >= now);

    }
    export function logout() {

    }



}