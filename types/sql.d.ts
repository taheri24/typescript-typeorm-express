//import {Query} from '../src/db';

  interface IQuery {
    dynamicSelect(params: any): [string,any[]];
}

declare module '*.sql' {

    const q:IQuery;
    export default q;
}
 