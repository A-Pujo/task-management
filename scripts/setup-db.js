#!/usr/bin/env node

/**
 * This script helps set up the PostgreSQL database for Supabase
 * It creates the necessary tables and relationships
 */

const { exec } = require("child_process");
const path = require("path");

console.log("🚀 Setting up PostgreSQL database for Supabase...");

// Step 1: Generate Prisma client
console.log("\n📦 Generating Prisma client...");
exec("npx prisma generate", (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Error generating Prisma client: ${error.message}`);
    return;
  }

  console.log(stdout);
  console.log("✅ Prisma client generated successfully");

  // Step 2: Push schema to database
  console.log("\n📤 Pushing schema to database...");
  exec("npx prisma db push --accept-data-loss", (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error pushing schema to database: ${error.message}`);
      return;
    }

    console.log(stdout);
    console.log("✅ Schema pushed to database successfully");

    console.log(
      "\n🎉 Setup complete! Your PostgreSQL database is ready to use with Supabase"
    );
    console.log("\n📝 Next steps:");
    console.log("1. Start your development server: npm run dev");
    console.log(
      "2. Your app should now connect to Supabase PostgreSQL database using Prisma ORM"
    );
  });
});
