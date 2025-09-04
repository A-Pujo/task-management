-- Function to list all tables in the public schema
CREATE OR REPLACE FUNCTION list_tables()
RETURNS TABLE (
  table_name text,
  column_count bigint,
  row_estimate bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text,
    COUNT(c.column_name)::bigint AS column_count,
    COALESCE(s.n_live_tup, 0)::bigint AS row_estimate
  FROM 
    information_schema.tables t
  LEFT JOIN 
    information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
  LEFT JOIN 
    pg_stat_user_tables s ON t.table_name = s.relname
  WHERE 
    t.table_schema = 'public' AND
    t.table_type = 'BASE TABLE'
  GROUP BY 
    t.table_name, s.n_live_tup
  ORDER BY 
    t.table_name;
END;
$$;
