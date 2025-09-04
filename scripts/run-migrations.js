#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Check environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "\x1b[31m%s\x1b[0m",
    "Error: Missing Supabase environment variables"
  );
  console.log("Please create a .env file with:");
  console.log("  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url");
  console.log("  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key");
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Path to migrations
const migrationsDir = path.join(__dirname, "..", "supabase", "migrations");

async function runMigrations() {
  try {
    console.log("\n🔄 Running database migrations...\n");

    // Get all SQL files in order
    let files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.error(
        "\x1b[31m%s\x1b[0m",
        "No migration files found in " + migrationsDir
      );
      process.exit(1);
    }

    console.log(`Found ${files.length} migration files:\n`);
    files.forEach((file) => console.log(`  - ${file}`));
    console.log();

    // Run each migration
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      process.stdout.write(`⏳ Applying ${file}... `);

      try {
        // Execute SQL directly using RPC if available
        try {
          const { error: rpcError } = await supabase.rpc("run_sql", { sql });

          if (rpcError) {
            if (
              rpcError.message.includes('function "run_sql" does not exist')
            ) {
              // If the run_sql function doesn't exist, create it first
              if (file === "20250904000000_create_run_sql.sql") {
                // For this specific file, we need to execute it directly using raw REST API
                console.log("\n  ⚠️  Creating run_sql function first...");
                // Use raw REST API as fallback (this requires admin rights)
                throw new Error("Need to create run_sql function first");
              } else {
                throw rpcError;
              }
            } else {
              throw rpcError;
            }
          }
        } catch (error) {
          // Fall back to direct SQL execution using supabase.sql API (this may not work in all cases)
          const { error: sqlError } = await supabase
            .from("_sqlrun")
            .insert({ query: sql });

          if (sqlError) throw sqlError;
        }

        console.log("\x1b[32m%s\x1b[0m", "✅ Done");
      } catch (error) {
        console.log("\x1b[31m%s\x1b[0m", "❌ Failed");
        console.error(`  Error: ${error.message}`);
      }
    }

    console.log("\n🎉 Migration complete!\n");
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", "\n❌ Migration failed!");
    console.error(`Error: ${error.message}\n`);
    process.exit(1);
  }
}

runMigrations();
