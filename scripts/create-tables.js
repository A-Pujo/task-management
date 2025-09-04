#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: Supabase credentials missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file."
  );
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

// SQL statements for table creation
const CREATE_TASK_TABLE = `
CREATE TABLE IF NOT EXISTS "Task" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  inputDate DATE NOT NULL DEFAULT CURRENT_DATE,
  deadline DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'NEW',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

const CREATE_OBJECTIVE_TABLE = `
CREATE TABLE IF NOT EXISTS "Objective" (
  id SERIAL PRIMARY KEY,
  taskId INTEGER NOT NULL REFERENCES "Task"(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

const CREATE_LOG_TABLE = `
CREATE TABLE IF NOT EXISTS "Log" (
  id SERIAL PRIMARY KEY,
  taskId INTEGER NOT NULL REFERENCES "Task"(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

// Create helper functions
const createTable = async (sql, tableName) => {
  try {
    console.log(`Creating ${tableName} table...`);
    const { error } = await supabase.rpc("exec_sql", { sql });

    if (error) {
      console.error(`Error creating ${tableName} table:`, error);

      // Try direct SQL if RPC fails
      console.log(`Trying direct SQL for ${tableName}...`);
      const { error: directError } = await supabase.sql(sql);

      if (directError) {
        throw directError;
      } else {
        console.log(
          `${tableName} table created successfully using direct SQL.`
        );
      }
    } else {
      console.log(`${tableName} table created successfully using RPC.`);
    }

    return true;
  } catch (err) {
    console.error(`Failed to create ${tableName} table:`, err);
    return false;
  }
};

// Check if tables exist
const checkTableExists = async (tableName) => {
  try {
    console.log(`Checking if table ${tableName} exists...`);

    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", tableName);

    if (error) {
      console.error(`Error checking ${tableName} table:`, error);
      return false;
    }

    return data && data.length > 0;
  } catch (err) {
    console.error(`Error checking if ${tableName} exists:`, err);
    return false;
  }
};

// Main function
const createTables = async () => {
  console.log("Initializing database tables...");

  try {
    // Check and create Task table
    const taskExists = await checkTableExists("Task");
    if (!taskExists) {
      const taskCreated = await createTable(CREATE_TASK_TABLE, "Task");
      if (!taskCreated) {
        console.error("Failed to create Task table. Exiting.");
        process.exit(1);
      }
    } else {
      console.log("Task table already exists.");
    }

    // Check and create Objective table
    const objectiveExists = await checkTableExists("Objective");
    if (!objectiveExists) {
      const objectiveCreated = await createTable(
        CREATE_OBJECTIVE_TABLE,
        "Objective"
      );
      if (!objectiveCreated) {
        console.error("Failed to create Objective table. Exiting.");
        process.exit(1);
      }
    } else {
      console.log("Objective table already exists.");
    }

    // Check and create Log table
    const logExists = await checkTableExists("Log");
    if (!logExists) {
      const logCreated = await createTable(CREATE_LOG_TABLE, "Log");
      if (!logCreated) {
        console.error("Failed to create Log table. Exiting.");
        process.exit(1);
      }
    } else {
      console.log("Log table already exists.");
    }

    console.log("All database tables initialized successfully!");
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  }
};

// Run the main function
createTables().then(() => {
  console.log("Database setup complete!");
  process.exit(0);
});
