"use client";
import { useState } from "react";
import { initializeDatabase } from "../../lib/supabase-api";
import { showError, showSuccess } from "../../components/AlertProvider";
import Button from "../../components/Button";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const handleSetup = async () => {
    try {
      setLoading(true);
      setStatus(null);

      // Try to initialize the database
      const result = await initializeDatabase();

      setStatus({
        success: true,
        message: result.message || "Setup completed successfully",
      });

      showSuccess("Database tables created successfully!");
    } catch (error) {
      console.error("Setup error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      setStatus({
        success: false,
        message: "Setup failed",
        details: errorMessage,
      });

      showError(`Database setup failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {loading && <LoadingOverlay />}
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">
          Database Setup
        </h1>

        <p className="text-gray-600 mb-6">
          This utility will set up the database schema required for the task
          management application. It will create the necessary tables in your
          Supabase PostgreSQL database:
        </p>

        <ul className="list-disc pl-8 mb-6 text-gray-600">
          <li>Task table for storing task information</li>
          <li>Objective table for storing task objectives</li>
          <li>Log table for storing task activity logs</li>
        </ul>

        <Button
          onClick={handleSetup}
          disabled={loading || status?.success === true}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
            loading
              ? "bg-blue-400"
              : status?.success
              ? "bg-green-600"
              : "bg-blue-600 hover:bg-blue-700"
          } transition flex items-center justify-center`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Setting up...
            </>
          ) : status?.success ? (
            "Setup Complete"
          ) : (
            "Initialize Database"
          )}
        </Button>

        {status?.success && (
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full mt-3 py-3 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition"
          >
            Go to Dashboard
          </Button>
        )}

        {status && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              status.success
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <p className="font-medium">{status.message}</p>
            {status.details && <p className="mt-2 text-sm">{status.details}</p>}

            {status.success && (
              <div className="mt-4 text-sm">
                <p>✅ Tables created successfully!</p>
                <p className="mt-2">
                  You can now use the application with your Supabase database.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="font-medium text-gray-700 mb-2">Troubleshooting</h2>
          <ul className="list-disc pl-5 text-sm text-gray-600">
            <li className="mb-1">
              Make sure your DATABASE_URL environment variable is correctly set
            </li>
            <li className="mb-1">
              Check if IP whitelisting is required in your Supabase project
              settings
            </li>
            <li className="mb-1">
              Verify that your database credentials are correct
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
