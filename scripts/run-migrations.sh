#!/bin/bash

# Make sure environment variables are loaded
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found. Please create it with your Supabase credentials."
  exit 1
fi

# Check if Supabase credentials are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "Error: Supabase credentials missing in .env file."
  echo "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  exit 1
fi

echo "Running database migration script..."
node scripts/create-tables.js

if [ $? -eq 0 ]; then
  echo "✅ Database setup completed successfully!"
  echo "You can now run the application with 'npm run dev'"
else
  echo "❌ Database setup failed. Please check the error messages above."
fi
