import * as dotenv from "dotenv";

dotenv.config();
let path;
switch (process.env.NODE_ENV) {
  case "test":
    path = `${__dirname}/../../.env.test`;
    break;
  case "production":
    path = `${__dirname}/../../.env.production`;
    break;
  default:
    path = `${__dirname}/../../.env`;
}
dotenv.config({ path: path });

export const DB_HOST = process.env.DB_HOST !== undefined ? process.env.DB_HOST : '';
export const JWT_SECRET = process.env.JWT_SECRET !== undefined ? process.env.JWT_SECRET : '';
export const SERVER_PORT = process.env.SERVER_PORT !== undefined ? process.env.SERVER_PORT : '3000';