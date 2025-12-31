
import dotenv from 'dotenv';
dotenv.config();
import postgres from 'postgres';

async function testPort(port: string, useSsl: boolean, prepare: boolean) {
    const baseUrl = process.env.DATABASE_URL;
    if (!baseUrl) {
        console.log('No DATABASE_URL');
        return;
    }

    // Replace port in URL
    let url = baseUrl.replace(/:(\d+)\//, `:${port}/`);
    // Strip params
    url = url.split('?')[0];

    console.log(`Testing Port ${port} | SSL: ${useSsl} | Prepare: ${prepare}`);

    try {
        const sql = postgres(url, {
            ssl: useSsl ? { rejectUnauthorized: false } : undefined,
            prepare: prepare,
            connect_timeout: 5,
        });

        const res = await sql`SELECT 1 as one`;
        console.log(`SUCCESS Port ${port}:`, res);
        await sql.end();
    } catch (err: any) {
        console.log(`FAILURE Port ${port}:`, err.code || err.message);
    }
}

async function run() {
    // Test 1: Port 5432 (Direct/Session), SSL, Prepare=True (Default)
    await testPort('5432', true, true);

    // Test 2: Port 5432 (Direct/Session), SSL, Prepare=False
    await testPort('5432', true, false);

    // Test 3: Port 6543 (Transaction), SSL, Prepare=False
    await testPort('6543', true, false);
}

run();
