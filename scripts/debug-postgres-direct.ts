
import dotenv from 'dotenv';
dotenv.config();
import postgres from 'postgres';
import fs from 'fs';

const log = (msg: string) => fs.appendFileSync('debug_pg.log', msg + '\n');

async function test() {
    fs.writeFileSync('debug_pg.log', 'Starting...\n');
    const url = process.env.DATABASE_URL;
    log(`URL Host: ${url?.split('@')[1]}`);

    if (!url) {
        log('No DATABASE_URL');
        return;
    }

    // Test 1: Standard
    try {
        log('Test 1: Standard options');
        const sql = postgres(url, { ssl: 'require', prepare: false });
        const res = await sql`SELECT 1 as one`;
        log(`Test 1 Success: ${JSON.stringify(res)}`);
        await sql.end();
    } catch (err: any) {
        log(`Test 1 Error: ${err.code} ${err.message}`);
    }

    // Test 2: Only URL params
    try {
        log('Test 2: Only URL params');
        const sql = postgres(url); // defaults
        const res = await sql`SELECT 1 as one`;
        log(`Test 2 Success: ${JSON.stringify(res)}`);
        await sql.end();
    } catch (err: any) {
        log(`Test 2 Error: ${err.code} ${err.message}`);
    }
}

test();
