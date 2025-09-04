"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Initialize the Supabase client for client components
let supabaseClient: SupabaseClient | null = null;

// Create a function to initialize the client that can be retried
const initializeClient = (): SupabaseClient | null => {
  try {
    if (typeof window === "undefined") {
      console.warn("Cannot initialize Supabase client on server-side");
      return null;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase client environment variables are missing");
      return null;
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    return null;
  }
};

// Initialize the client
if (typeof window !== "undefined") {
  supabaseClient = initializeClient();
}

export { supabaseClient };
