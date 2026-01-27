import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'animal_blog',
});

interface Migration {
    name: string;
    executed_at: Date;
}

async function createMigrationsTable(): Promise<void> {
    const query = `
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await pool.query(query);
    console.log('✓ Migrations tracking table ready');
}

async function getExecutedMigrations(): Promise<string[]> {
    const result = await pool.query<Migration>(
        'SELECT name FROM migrations ORDER BY name'
    );
    return result.rows.map(row => row.name);
}

async function getMigrationFiles(): Promise<string[]> {
    const migrationsDir = path.join(__dirname, '../database/migrations');

    if (!fs.existsSync(migrationsDir)) {
        console.log('⚠ No migrations directory found');
        return [];
    }

    const files = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

    return files;
}

async function executeMigration(filename: string): Promise<void> {
    const migrationsDir = path.join(__dirname, '../database/migrations');
    const filePath = path.join(migrationsDir, filename);
    const sql = fs.readFileSync(filePath, 'utf-8');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Execute the migration SQL
        await client.query(sql);

        // Record the migration
        await client.query(
            'INSERT INTO migrations (name) VALUES ($1)',
            [filename]
        );

        await client.query('COMMIT');
        console.log(`✓ Executed migration: ${filename}`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`✗ Failed to execute migration: ${filename}`);
        throw error;
    } finally {
        client.release();
    }
}

async function runMigrations(): Promise<void> {
    console.log('🔄 Starting database migrations...\n');

    try {
        // Create migrations tracking table if it doesn't exist
        await createMigrationsTable();

        // Get list of executed migrations
        const executedMigrations = await getExecutedMigrations();
        console.log(`📋 Found ${executedMigrations.length} executed migration(s)`);

        // Get list of migration files
        const migrationFiles = await getMigrationFiles();
        console.log(`📁 Found ${migrationFiles.length} migration file(s)\n`);

        // Find pending migrations
        const pendingMigrations = migrationFiles.filter(
            file => !executedMigrations.includes(file)
        );

        if (pendingMigrations.length === 0) {
            console.log('✓ Database is up to date. No pending migrations.\n');
            return;
        }

        console.log(`⏳ Executing ${pendingMigrations.length} pending migration(s)...\n`);

        // Execute pending migrations in order
        for (const migration of pendingMigrations) {
            await executeMigration(migration);
        }

        console.log('\n✅ All migrations completed successfully!\n');
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run migrations
runMigrations();
