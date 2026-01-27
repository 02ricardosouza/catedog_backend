import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'animal_blog',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
});

pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const query = (text: string, params?: any[]): Promise<QueryResult> => pool.query(text, params);
