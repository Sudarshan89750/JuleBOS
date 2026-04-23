import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let dbInstance: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDb() {
    if (!dbInstance) {
        dbInstance = await open({
            filename: path.join(__dirname, '..', 'julebos.sqlite'),
            driver: sqlite3.Database
        });

        // Initialize a test table for the user to play with
        await dbInstance.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL
            );
        `);

        // Insert some seed data if empty
        const count = await dbInstance.get('SELECT COUNT(*) as count FROM users');
        if (count && count.count === 0) {
            await dbInstance.run('INSERT INTO users (name, email) VALUES (?, ?)', ['Alice Admin', 'alice@example.com']);
            await dbInstance.run('INSERT INTO users (name, email) VALUES (?, ?)', ['Bob Builder', 'bob@example.com']);
        }
    }
    return dbInstance;
}
