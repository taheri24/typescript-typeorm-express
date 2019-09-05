import "reflect-metadata";
import { createConnection } from "typeorm";

import entities from './entities';
import * as express from "express";
import * as bodyParser from "body-parser";
import { readJSON } from "fs-extra";
import { join } from 'path';
import api from "./api";
// create connection with database
// note that it's not active database connection
// TypeORM creates connection pools and uses them for your requests
async function main() {
    const ormConfig = await readJSON(join(process.cwd(), 'ormconfig.json'));
  //  const connection = await createConnection({...ormConfig,entities});
    const app = express();
    app.use(bodyParser.json());
    app.use('/api',api())
    app.listen(3000);
    
    console.log("Express application is up and running on port 3000");

}


main( ).then(console.log,console.error);