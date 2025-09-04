"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase-client";

export default function ConnectionTestPage() {
  const [loading, setLoading] = useState(false);
  const [supabaseResult, setSupabaseResult] = useState<any>(null);
  const [tablesResult, setTablesResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testSupabaseConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      // Test Supabase connection using REST API
      const { data, error } = await supabase
        .from("Task")
        .select("count")
        .limit(1);

      if (error) throw error;

      setSupabaseResult({
        success: true,
        message: "Successfully connected to Supabase",
        data,
      });
    } catch (err: any) {
      console.error("Supabase connection test failed:", err);
      setSupabaseResult({
        success: false,
        message: "Failed to connect to Supabase",
        error: err.message || String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  const testTablesList = async () => {
    setLoading(true);
    setError(null);
    try {
      // List all tables in the public schema
      const { data, error } = await supabase.rpc("list_tables");

      if (error) throw error;

      setTablesResult({
        success: true,
        message: "Successfully retrieved database tables",
        data,
      });
    } catch (err: any) {
      console.error("Table listing failed:", err);
      setTablesResult({
        success: false,
        message: "Failed to list database tables",
        error: err.message || String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">
          Database Connection Test
        </h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Supabase Connection Test */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-medium mb-4">Supabase REST API Test</h2>
            <p className="text-gray-600 mb-4">
              Test the connection to Supabase using the REST API client.
            </p>

            <button
              onClick={testSupabaseConnection}
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg font-medium text-white ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } transition`}
            >
              {loading ? "Testing..." : "Test Supabase Connection"}
            </button>

            {supabaseResult && (
              <div
                className={`mt-4 p-4 rounded-md ${
                  supabaseResult.success ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <p
                  className={`font-medium ${
                    supabaseResult.success ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {supabaseResult.message}
                </p>
                {supabaseResult.error && (
                  <p className="mt-2 text-sm text-red-600">
                    {supabaseResult.error}
                  </p>
                )}
                {supabaseResult.data && (
                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto text-sm">
                    {JSON.stringify(supabaseResult.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Database Tables Test */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-medium mb-4">Database Tables</h2>
            <p className="text-gray-600 mb-4">
              List all tables in your Supabase database.
            </p>

            <button
              onClick={testTablesList}
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg font-medium text-white ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } transition`}
            >
              {loading ? "Listing tables..." : "List Database Tables"}
            </button>

            {tablesResult && (
              <div
                className={`mt-4 p-4 rounded-md ${
                  tablesResult.success ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <p
                  className={`font-medium ${
                    tablesResult.success ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {tablesResult.message}
                </p>
                {tablesResult.error && (
                  <p className="mt-2 text-sm text-red-600">
                    {tablesResult.error}
                  </p>
                )}
                {tablesResult.data && (
                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto text-sm">
                    {JSON.stringify(tablesResult.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-medium mb-4">Connection Information</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-gray-700">
                Supabase Configuration
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>
                  <span className="font-medium">URL:</span>{" "}
                  {process.env.NEXT_PUBLIC_SUPABASE_URL}
                </li>
                <li>
                  <span className="font-medium">Key:</span>{" "}
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10)}
                  ...
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-700">
                Database Configuration
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>
                  <span className="font-medium">Database:</span> PostgreSQL
                </li>
                <li>
                  <span className="font-medium">Host:</span>{" "}
                  db.hogmghtjnlmzsmxcxbht.supabase.co
                </li>
                <li>
                  <span className="font-medium">Access:</span> Supabase API
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <h3 className="font-medium text-gray-700 mb-2">
              Troubleshooting Tips
            </h3>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>
                Make sure your DATABASE_URL has{" "}
                <code className="bg-gray-100 px-1 rounded">
                  sslmode=require
                </code>{" "}
                for Supabase connections
              </li>
              <li>
                Check if your IP address needs to be whitelisted in Supabase
                dashboard
              </li>
              <li>Verify that your database credentials are correct</li>
              <li>Try using Supabase migrations to create your tables</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
