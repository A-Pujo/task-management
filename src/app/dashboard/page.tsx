"use client";
import { useEffect, useState } from "react";
import { TASK_STATUS, Task } from "../../lib/constants";
import LoadingOverlay from "../../components/LoadingOverlay";
import { showError, showWarning } from "../../components/AlertProvider";
import { supabaseClient } from "../../lib/supabase-client-browser";
import Card from "../../components/Card";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/Table";
import Button from "../../components/Button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const DEFAULT_START = "2025-01-01";
const DEFAULT_END = "2025-12-31";

function getStats(tasks: Task[], start: string, end: string) {
  const filtered = tasks.filter(
    (t) => t.inputDate >= start && t.inputDate <= end
  );
  return {
    done: filtered.filter((t) => t.status === "DONE").length,
    progress: filtered.filter((t) => t.status === "IN_PROGRESS").length,
    critical: filtered.filter((t) => t.status === "CRITICAL").length,
  };
}

export default function DashboardPage() {
  const [start, setStart] = useState(DEFAULT_START);
  const [end, setEnd] = useState(DEFAULT_END);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [dbInitialized, setDbInitialized] = useState(true);

  // Function to format tasks from the API response
  const formatTasks = (data: any[]): Task[] => {
    return data.map((task: any) => ({
      id: task.id,
      name: task.name,
      inputDate: task.inputDate
        ? typeof task.inputDate === "string"
          ? task.inputDate.split("T")[0]
          : new Date(task.inputDate).toISOString().split("T")[0]
        : "",
      deadline: task.deadline
        ? typeof task.deadline === "string"
          ? task.deadline.split("T")[0]
          : new Date(task.deadline).toISOString().split("T")[0]
        : "",
      status: task.status as keyof typeof TASK_STATUS,
      description: task.description || undefined,
    }));
  };

  // Function to fetch tasks using client-side Supabase
  const fetchTasksClientSide = async () => {
    if (!supabaseClient) {
      showError("Supabase client not initialized");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabaseClient.from("Task").select("*");

      if (error) {
        console.error("Supabase client error:", error);
        setDbInitialized(false);

        if (error.code === "42P01") {
          showWarning("Database tables not found. Please run setup.");
        } else {
          showError(`Error: ${error.message}`);
        }
        return;
      }

      setDbInitialized(true);

      if (!data || data.length === 0) {
        setTasks([]);
        return;
      }

      const formattedTasks = formatTasks(data);
      setTasks(formattedTasks);
    } catch (err: any) {
      console.error("Client-side fetch error:", err);
      setDbInitialized(false);

      if (err.message?.includes("env")) {
        showError(
          "Database configuration error. Please check environment variables."
        );
      } else if (err.code === "42P01") {
        showError("Database tables not found. Please run migrations.");
      } else {
        showError(`Failed to fetch tasks: ${err.message || "Unknown error"}`);
      }
    }
  };

  useEffect(() => {
    setLoading(true);

    // Fetch tasks using client-side approach
    fetchTasksClientSide().finally(() => setLoading(false));
  }, []);

  const stats = getStats(tasks, start, end);
  const pagedTasks = tasks.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(tasks.length / pageSize);

  return (
    <div>
      {loading && <LoadingOverlay />}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="flex items-center gap-4">
          <CheckCircle className="text-blue-500 w-8 h-8" />
          <div>
            <div className="text-2xl font-extrabold text-blue-700">
              {stats.done}
            </div>
            <div className="text-sm text-gray-600">Task Done</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <Loader2 className="text-yellow-500 w-8 h-8 animate-spin" />
          <div>
            <div className="text-2xl font-extrabold text-yellow-600">
              {stats.progress}
            </div>
            <div className="text-sm text-gray-600">Task Progress</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <AlertCircle className="text-red-500 w-8 h-8" />
          <div>
            <div className="text-2xl font-extrabold text-red-600">
              {stats.critical}
            </div>
            <div className="text-sm text-gray-600">Critical Tasks</div>
          </div>
        </Card>
      </div>
      {/* Date Range Filter & Create Task Button */}
      <div className="mb-6 flex gap-4 items-center justify-center">
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border rounded p-2"
        />
        <span>to</span>
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border rounded p-2"
        />
        <Button
          className="ml-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow"
          onClick={() => (window.location.href = "/tasks/new")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Task
        </Button>
      </div>

      {/* Database Initialization Alert */}
      {!dbInitialized && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg shadow-sm flex items-start">
          <div className="text-yellow-700 mr-3 flex-shrink-0 pt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-yellow-800">
              Database Not Initialized
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Please initialize the database tables for this application to work
              properly.
            </p>
            <div className="mt-2 flex space-x-3">
              <Button
                onClick={() => (window.location.href = "/setup")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Go to Setup Page
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <Table className="w-full border border-gray-200 rounded-xl overflow-hidden shadow-lg">
        <TableHead className="bg-gray-50 border-b border-gray-300">
          <TableRow>
            <TableCell className="font-bold text-blue-700">Task Name</TableCell>
            <TableCell className="font-bold text-gray-700">
              Input Date
            </TableCell>
            <TableCell className="font-bold text-gray-700">Deadline</TableCell>
            <TableCell className="font-bold text-gray-700">Status</TableCell>
            <TableCell className="font-bold text-gray-700">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pagedTasks.map((task) => (
            <TableRow
              key={task.id}
              className={
                task.status === "CRITICAL"
                  ? "bg-red-50 border-l-4 border-red-400"
                  : task.status === "DONE"
                  ? "bg-blue-50 border-l-4 border-blue-400"
                  : task.status === "IN_PROGRESS"
                  ? "bg-yellow-50 border-l-4 border-yellow-400"
                  : "bg-white"
              }
            >
              <TableCell>{task.name}</TableCell>
              <TableCell>{task.inputDate}</TableCell>
              <TableCell>{task.deadline}</TableCell>
              <TableCell className="font-semibold">
                {TASK_STATUS[task.status]}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => (window.location.href = `/tasks/${task.id}`)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {/* Table Footer for Pagination */}
        <tfoot className="bg-gray-50 border-t border-gray-300">
          <tr>
            <td colSpan={5} className="py-4">
              <div className="flex gap-4 justify-center items-center">
                <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Prev
                </Button>
                <span className="text-gray-700 font-bold">
                  Page {page} of {totalPages}
                </span>
                <Button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </td>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
}
