-- Create a function to execute SQL statements
-- This should be run as a superuser/admin in Supabase SQL Editor
CREATE OR REPLACE FUNCTION run_sql(sql text) 
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
