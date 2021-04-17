/**
 * constants that will be used all over the server
 */

export const __prod__ = process.env.NODE_ENV === "production";
export const COOKIE_NAME = process.env.COOKIE_NAME!;
export const DB_NAME = process.env.TYPEORM_DB_NAME!;
export const DB_USER = process.env.TYPEORM_DB_USER!;
export const DB_PASSWORD = process.env.TYPEORM_DB_PASSWORD!;
export const DB_TYPE = process.env.TYPEORM_DB_TYPE!;
export const DB_HOST = process.env.DB_HOST!;
export const NODE_ENV = process.env.NODE_ENV!;
export const SERVER_PORT = process.env.SERVER_PORT!;
export const REDIS_SECRET_KEY = process.env.REDIS_SECRET_KEY!;
export const CLIENT_URL = process.env.CLIENT_URL!;
export const FORGET_PASSWORD_PREFIX = process.env.FORGET_PASSWORD_PREFIX!;
