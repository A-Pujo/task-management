-- Migration for Task Management App (based on Prisma schema)

-- Task table
CREATE TABLE IF NOT EXISTS "Task" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "inputDate" TIMESTAMP NOT NULL,
  "deadline" TIMESTAMP NOT NULL,
  "status" TEXT NOT NULL,
  "description" TEXT
);

-- Log table
CREATE TABLE IF NOT EXISTS "Log" (
  "id" SERIAL PRIMARY KEY,
  "taskId" INTEGER NOT NULL,
  "date" TIMESTAMP NOT NULL,
  "message" TEXT NOT NULL,
  FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE
);

-- Objective table
CREATE TABLE IF NOT EXISTS "Objective" (
  "id" SERIAL PRIMARY KEY,
  "taskId" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ONGOING',
  "createdDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE
);

-- Create updatedDate trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedDate" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for Objective table
CREATE TRIGGER update_objective_updated_at
BEFORE UPDATE ON "Objective"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
