
import fetch from 'node-fetch';
import fs from 'fs';

async function verify() {
    try {
        console.log('Fetching products...');
        const res = await fetch('http://localhost:3000/api/products?page=1&limit=10&isActive=true');
        console.log('Status:', res.status);
        const text = await res.text();
        fs.writeFileSync('debug_response.txt', text);
        console.log('Response saved to debug_response.txt');
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

verify();
