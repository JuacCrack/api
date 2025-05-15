import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(import.meta.dir, 'keys.env') });

export const dbname = process.env.DB_NAME;

export const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbname,
});
