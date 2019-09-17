/// <reference lib="es2019.Object" />
/// <reference lib="es2015.iterable" />

import { Connection, ObjectType } from "typeorm";
import { Dictionary } from "express-serve-static-core";
import { readFileSync } from "fs-extra";

let defaultConnection: Connection = null;
require.extensions['.sql'] = (m, filename) => {
    const sqlText = readFileSync(filename, { encoding: 'utf-8' });
    m.exports = new Query(sqlText);
}
export function setDefaultConnection(conn: Connection) {
    defaultConnection = conn;
}
export function getDefaultConnection() {
    if (!defaultConnection) throw 'defaultConnection Not Set';
    return defaultConnection;
}
export class Query {
    public sqlParameters: string[];
    public subQueries: { [index: string]: Query };
    constructor(public sqlText: string, hasSubQueries = true) {
        //TODO
        this.sqlParameters = Array.from(sqlText.match(/[@][a-zA-Z0-9_]+/)).map(s => s.replace('@', ''))
        if (hasSubQueries) {
            const sqlLines = sqlText.split("\n").map(line => line.trim()).concat('-- last' + new Date());
            let capturingSubQueryName: string;
            const subQuerySqlTexts: { [subQueryName: string]: string[] } = {};
            for (const sqlLine of sqlLines) {
                if (/--[ ][a-z][A-Za-z0-9]+/.test(sqlLine)) {
                    capturingSubQueryName = sqlLine.replace('-- ', '');
                    continue;
                }
                if (!capturingSubQueryName) continue;
                subQuerySqlTexts[capturingSubQueryName] = subQuerySqlTexts[capturingSubQueryName] || [];
                subQuerySqlTexts[capturingSubQueryName].push(sqlLine);

            }
            const { fromEntries, entries } = Object;
            this.subQueries = fromEntries(entries(subQuerySqlTexts).map(([subQueryName, sqlText]) => [subQueryName, new Query(sqlText.join("\n\r"), false)]))
        }
    }
    static operatorSymbols = {
        'eq': '=',
        'gte': '>=',
        'gt': '>',
        'lt': '<',
        'lte': '<='
    }
    static getCountingQuery(sqlText: string) {
        return sqlText
            .split("\n")
            .map(line => ['SELECT', '*', 'FROM', 'CTE'].every(sub => line.includes(sub)) ? 'SELECT COUNT(*) AS total FROM CTE' : line)
            .join("\n");
    }
    dynamicSelect(params: Dictionary<any>) {
        const whereSegments: string[] = [];
        const sqlParamValues: any[] = [];
        for (const [paramKey, paramValue] of Object.entries(params)) {
            if (this.sqlParameters.includes(paramKey)) continue;
            const [fieldName, operatorName = 'eq'] = paramKey.split('_');
            if (paramValue instanceof Array) {
                whereSegments.push(`(${fieldName} IN (${paramValue.map(() => '?').join(',')}))`);
                sqlParamValues.push(...paramValue);
            }
            else {
                const operatorSymbol = Query.operatorSymbols[operatorName];
                if (!operatorSymbol) continue;
                sqlParamValues.push(paramValue);
                whereSegments.push(`${fieldName} ${operatorSymbol} ? `);
            }

        }
        let sqlText = whereSegments.length == 0 ? this.sqlText : this.sqlText.replace('(1=1)', whereSegments.join(' AND '));
        //sqlText=sqlText.rep
        return [sqlText, sqlParamValues];
    }

}
const allRepositories: any = {};
export const getRepository: typeof Connection.prototype.getRepository = entity => {
    return new Proxy<ObjectType<typeof entity>>(entity as any, {
        get(entity, p) {
            const entityKey: any = entity;
            allRepositories[entityKey] = allRepositories[entityKey] || getDefaultConnection().getRepository(entity);
            const repo = allRepositories[entityKey];
            const member = repo[p];
            if (member instanceof Function) return member.bind(repo);
            return member;
        }
    }) as any;
}