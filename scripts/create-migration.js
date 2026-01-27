#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Get migration name from command line arguments
const args = process.argv.slice(2);
const migrationName = args[0];

if (!migrationName) {
    console.error('❌ Error: Migration name is required');
    console.log('Usage: npm run migrate:create <migration_name>');
    console.log('Example: npm run migrate:create add_user_roles');
    process.exit(1);
}

// Validate migration name (only alphanumeric and underscores)
if (!/^[a-z0-9_]+$/.test(migrationName)) {
    console.error('❌ Error: Migration name must contain only lowercase letters, numbers, and underscores');
    process.exit(1);
}

// Get migrations directory
const migrationsDir = path.join(__dirname, '../database/migrations');

// Create migrations directory if it doesn't exist
if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
}

// Get existing migration files to determine the next number
const existingMigrations = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

let nextNumber = 1;
if (existingMigrations.length > 0) {
    const lastMigration = existingMigrations[existingMigrations.length - 1];
    const lastNumber = Number.parseInt(lastMigration.split('_')[0]);
    nextNumber = lastNumber + 1;
}

// Format number with leading zeros (e.g., 001, 002, etc.)
const formattedNumber = String(nextNumber).padStart(3, '0');
const filename = `${formattedNumber}_${migrationName}.sql`;
const filepath = path.join(migrationsDir, filename);

// Create migration file template
const currentDate = new Date().toISOString().split('T')[0];
const template = `-- Migration: ${formattedNumber}_${migrationName}
-- Description: [Add description here]
-- Created: ${currentDate}

-- Add your SQL statements here
-- Example:
-- CREATE TABLE IF NOT EXISTS example (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
`;

fs.writeFileSync(filepath, template);

console.log(`✅ Created migration file: ${filename}`);
console.log(`📝 Edit the file at: ${filepath}`);
