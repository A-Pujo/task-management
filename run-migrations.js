#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

// Path to migrations folder
const migrationsDir = path.join(__dirname, "supabase", "migrations");

async function runMigrations() {
  try {
    console.log("Running SQL migrations...");

    // Get all SQL files sorted alphabetically
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of migrationFiles) {
      console.log(`Applying migration: ${file}`);
      const sqlContent = fs.readFileSync(
        path.join(migrationsDir, file),
        "utf8"
      );

      // Use curl to call Supabase REST API with SQL
      const command = `curl -X POST "${SUPABASE_URL}/rest/v1/rpc/run_sql" \\
        -H "apikey: ${SUPABASE_KEY}" \\
        -H "Authorization: Bearer ${SUPABASE_KEY}" \\
        -H "Content-Type: application/json" \\
        -d '{"sql": "${sqlContent
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n")}"}'`;

      try {
        execSync(command, { stdio: "inherit" });
        console.log(`✅ Successfully applied ${file}`);
      } catch (error) {
        console.error(`❌ Failed to apply ${file}:`, error.message);
      }
    }

    console.log("All migrations completed.");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

runMigrations();
