#!/bin/bash

# Script to set up and deploy Supabase migrations

echo "🚀 Setting up Supabase migrations..."

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install Supabase CLI if not already installed
echo "📦 Installing Supabase CLI..."
npm install -g supabase

# Link to the Supabase project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref hogmghtjnlmzsmxcxbht

# Push the migrations
echo "⬆️ Pushing migrations to Supabase..."
supabase db push

echo "✅ Done! Your database schema has been deployed to Supabase."
