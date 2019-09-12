/// <reference path="../types/index.d.ts" />
import "reflect-metadata";
import { setDefaultConnection } from "./db";
import { createConnection, Entity } from "typeorm";
import cors from 'cors';
import express from "express";
import bodyParser from "body-parser";
import { readJSON } from "fs-extra";
import { join } from 'path';
import api from "./api";
import * as entities from "./entities";
async function main() {
  const ormConfig = await readJSON(join(process.cwd(), 'ormconfig.json'));

  setDefaultConnection(await createConnection({
    ...ormConfig,
    entities: Object.values(entities)
  }));

  const app = express();
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use('/api', api());
  app.listen(3000);
  console.log("Express application is up and running on port 3000");
}
main().then(() => 0, console.error);