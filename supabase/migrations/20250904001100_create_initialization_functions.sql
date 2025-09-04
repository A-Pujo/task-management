-- Functions for creating tables if they don't exist

-- Create Task table function
CREATE OR REPLACE FUNCTION create_task_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS "Task" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "inputDate" TIMESTAMP NOT NULL,
    "deadline" TIMESTAMP NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT
  );
END;
$$;

-- Create Log table function
CREATE OR REPLACE FUNCTION create_log_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS "Log" (
    "id" SERIAL PRIMARY KEY,
    "taskId" INTEGER NOT NULL,
    "date" TIMESTAMP NOT NULL,
    "message" TEXT NOT NULL,
    FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE
  );
END;
$$;

-- Create Objective table function
CREATE OR REPLACE FUNCTION create_objective_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the table
  CREATE TABLE IF NOT EXISTS "Objective" (
    "id" SERIAL PRIMARY KEY,
    "taskId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ONGOING',
    "createdDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE
  );

  -- Create the update trigger function if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW."updatedDate" = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  END IF;

  -- Create the trigger if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_objective_updated_at'
  ) THEN
    CREATE TRIGGER update_objective_updated_at
    BEFORE UPDATE ON "Objective"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;
