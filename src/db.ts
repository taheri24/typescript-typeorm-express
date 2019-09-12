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
    constructor(public sqlText: string) {


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
        const sqlText = whereSegments.length == 0 ? this.sqlText : this.sqlText.replace('(1=1)', whereSegments.join(' AND '))

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