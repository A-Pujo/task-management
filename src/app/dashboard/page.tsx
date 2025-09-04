"use client";
import { useEffect, useState } from "react";
import { TASK_STATUS, Task } from "../../lib/constants";
import { fetchTasks } from "../../lib/actions";
import LoadingOverlay from "../../components/LoadingOverlay";
import { showError } from "../../components/AlertProvider";
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

// ...existing code...

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

  useEffect(() => {
    setLoading(true);
    fetchTasks()
      .then((data) => {
        // Transform to match Task interface
        const formattedTasks = data.map((task) => ({
          id: task.id,
          name: task.name,
          inputDate: task.inputDate.toISOString().split("T")[0],
          deadline: task.deadline.toISOString().split("T")[0],
          status: task.status as keyof typeof TASK_STATUS,
          description: task.description || undefined,
        }));
        setTasks(formattedTasks);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        showError("Failed to fetch tasks");
      });
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
