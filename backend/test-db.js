const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function test() {
    const db = await open({
        filename: path.join(__dirname, '..', 'julebos.sqlite'),
        driver: sqlite3.Database
    });
    const logs = await db.all('SELECT execution_id, node_type, status, duration_ms FROM execution_logs ORDER BY started_at DESC LIMIT 5');
    console.log(logs);
}
test();
