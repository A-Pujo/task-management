"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  TASK_STATUS,
  OBJECTIVE_STATUS,
  Task,
  Objective,
} from "../../../lib/constants";
import {
  fetchTaskDetail,
  addTaskLog,
  updateTaskStatus,
  deleteTask,
  addObjective,
  updateObjectiveStatus,
  deleteObjective,
} from "../../../lib/supabase-api";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { showError, showSuccess } from "../../../components/AlertProvider";

export default function TaskViewPage() {
  const [deleting, setDeleting] = useState(false);
  const params = useParams();
  const id = Number(params?.id);
  const [task, setTask] = useState<Task | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [logs, setLogs] = useState<{ date: string; message: string }[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [objectiveUpdating, setObjectiveUpdating] = useState<number | null>(
    null
  );
  const [logMsg, setLogMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New state for adding objectives
  const [newObjective, setNewObjective] = useState({
    description: "",
    status: "ONGOING" as keyof typeof OBJECTIVE_STATUS,
  });
  const [addingObjective, setAddingObjective] = useState(false);
  const [deletingObjective, setDeletingObjective] = useState<number | null>(
    null
  );

  const handleObjectiveStatusUpdate = async (
    objectiveId: number,
    newStatus: string
  ) => {
    setObjectiveUpdating(objectiveId);
    try {
      // Now using the server action
      const result = await updateObjectiveStatus(objectiveId, newStatus);

      // Check if the operation was successful
      if (result && result.success === false) {
        showError(
          result.message ||
            "Failed to update objective status - table may not exist yet"
        );
        throw new Error(result.message || "Table doesn't exist yet");
      }

      // Update local state
      setObjectives((prevObjectives) =>
        prevObjectives.map((obj) =>
          obj.id === objectiveId
            ? {
                ...obj,
                status: newStatus as keyof typeof OBJECTIVE_STATUS,
                updatedDate: new Date().toISOString().split("T")[0],
              }
            : obj
        )
      );
      showSuccess("Objective status updated successfully");
    } catch (err) {
      console.error("Error updating objective status:", err);
      showError("Failed to update objective status");
    }
    setObjectiveUpdating(null);
  };

  // Function to delete an objective
  const handleDeleteObjective = async (objectiveId: number) => {
    if (!window.confirm("Are you sure you want to delete this objective?")) {
      return;
    }

    setDeletingObjective(objectiveId);
    try {
      const result = await deleteObjective(objectiveId);

      // Check if the operation was successful
      if (result && result.success === false) {
        showError(
          result.message ||
            "Failed to delete objective - table may not exist yet"
        );
        throw new Error(result.message || "Table doesn't exist yet");
      }

      // Remove from local state
      setObjectives((prevObjectives) =>
        prevObjectives.filter((obj) => obj.id !== objectiveId)
      );
      showSuccess("Objective deleted successfully");
    } catch (err) {
      console.error("Error deleting objective:", err);
      showError("Failed to delete objective");
    }
    setDeletingObjective(null);
  };

  // Function to add a new objective
  const handleAddObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjective.description.trim()) {
      showError("Objective description cannot be empty");
      return;
    }

    setAddingObjective(true);
    try {
      const result = await addObjective(id, {
        description: newObjective.description,
        status: newObjective.status,
      });

      // Handle the temporary implementation that returns {success: boolean}
      if (result && result.success === false) {
        showError(
          result.message || "Failed to add objective - table may not exist yet"
        );
        throw new Error(result.message || "Table doesn't exist yet");
      }

      // Generate a temporary ID until we refresh the page
      const tempId = Math.floor(Math.random() * -1000); // Negative ID to avoid conflicts

      // Add to local state with proper formatting
      const now = new Date();
      const formattedDate = now.toISOString().split("T")[0];

      setObjectives([
        ...objectives,
        {
          id: tempId, // Use temp ID since result doesn't have id yet
          description: newObjective.description,
          status: newObjective.status as keyof typeof OBJECTIVE_STATUS,
          createdDate: formattedDate,
          updatedDate: formattedDate,
        },
      ]);

      // Reset form
      setNewObjective({
        description: "",
        status: "ONGOING" as keyof typeof OBJECTIVE_STATUS,
      });

      showSuccess("Objective added successfully");
    } catch (err) {
      console.error("Error adding objective:", err);
      showError("Failed to add objective");
    }
    setAddingObjective(false);
  };

  useEffect(() => {
    setLoading(true);
    console.log("Fetching task details for ID:", id);

    fetchTaskDetail(String(id))
      .then((data: any) => {
        console.log("Task details received:", data);
        if (data) {
          // Format dates safely
          const formatDate = (dateInput: any): string => {
            if (!dateInput) return "";
            try {
              // Handle both Date objects and string dates
              const date =
                dateInput instanceof Date ? dateInput : new Date(dateInput);
              return date.toISOString().split("T")[0];
            } catch (e) {
              console.error("Date formatting error:", e);
              return String(dateInput);
            }
          };

          setTask({
            id: data.id,
            name: data.name,
            inputDate: formatDate(data.inputDate),
            deadline: formatDate(data.deadline),
            status: data.status as keyof typeof TASK_STATUS,
            description: data.description || undefined,
          });

          // Transform logs to match our state format
          if (data.logs) {
            const formattedLogs = data.logs.map((log: any) => {
              try {
                const date =
                  log.date instanceof Date ? log.date : new Date(log.date);
                return {
                  date: date.toISOString().slice(0, 16).replace("T", " "),
                  message: log.message,
                };
              } catch (e) {
                console.error("Error formatting log date:", e);
                return {
                  date: String(log.date),
                  message: log.message,
                };
              }
            });
            setLogs(formattedLogs);
          }

          // Handle objectives if they exist
          if (data.objectives && data.objectives.length > 0) {
            const formattedObjectives = data.objectives.map((obj: any) => ({
              id: obj.id,
              description: obj.description,
              status: obj.status as keyof typeof OBJECTIVE_STATUS,
              createdDate: formatDate(obj.createdDate),
              updatedDate: formatDate(obj.updatedDate),
            }));
            setObjectives(formattedObjectives);
          } else {
            setObjectives([]);
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching task details:", error);
        setError("Task not found");
        setLoading(false);
        showError("Task not found");
      });
  }, [id]);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logMsg.trim()) return;
    try {
      await addTaskLog(id, logMsg);
      setLogs([
        ...logs,
        {
          date: new Date().toISOString().slice(0, 16).replace("T", " "),
          message: logMsg,
        },
      ]);
      setLogMsg("");
      showSuccess("Log added successfully");
    } catch {
      setError("Failed to add log");
      showError("Failed to add log");
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }
  if (error || !task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-lg w-full bg-white border border-gray-200 shadow-lg rounded-xl p-10 text-center text-red-600 font-bold">
          {error || "Task not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
      {/* Fixed Top Bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mr-3 rounded-full bg-gray-100 hover:bg-gray-200 p-2 text-gray-500"
            title="Back"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-blue-700">Task: {task.name}</h2>
        </div>
        <button
          type="button"
          onClick={async () => {
            if (!window.confirm("Are you sure you want to delete this task?"))
              return;
            setDeleting(true);
            try {
              await deleteTask(id);
              showSuccess("Task deleted successfully");
              window.history.back();
            } catch {
              showError("Failed to delete task");
            }
            setDeleting(false);
          }}
          className="rounded-lg bg-red-100 hover:bg-red-200 px-3 py-2 text-red-600 flex items-center gap-1 transition font-medium text-sm"
          disabled={deleting}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span>Delete Task</span>
          {deleting && <span className="ml-1 text-xs">Deleting...</span>}
        </button>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Main Info */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
                <h3 className="text-lg font-bold text-blue-700 mb-4">
                  Task Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Name</span>
                    <span className="font-medium">{task.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Status</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={task.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value as Task["status"];
                          setStatusUpdating(true);
                          try {
                            await updateTaskStatus(id, newStatus);
                            setTask({ ...task, status: newStatus });
                            showSuccess("Status updated successfully");
                          } catch {
                            setError("Failed to update status");
                            showError("Failed to update status");
                          }
                          setStatusUpdating(false);
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        disabled={statusUpdating}
                      >
                        {Object.keys(TASK_STATUS).map((s) => (
                          <option key={s} value={s}>
                            {TASK_STATUS[s as keyof typeof TASK_STATUS]}
                          </option>
                        ))}
                      </select>
                      {statusUpdating && (
                        <span className="text-xs text-blue-500">
                          Updating...
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Input Date</span>
                    <span className="font-medium">{task.inputDate}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Deadline</span>
                    <span className="font-medium">{task.deadline}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Description</span>
                  <p className="mt-1">
                    {task.description || "No description provided"}
                  </p>
                </div>
              </div>

              {/* Objectives Section */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-blue-700">
                    Objectives
                  </h3>
                </div>

                {/* Form to add new objective */}
                <form
                  onSubmit={handleAddObjective}
                  className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <h4 className="text-sm font-medium text-blue-800 mb-3">
                    Add New Objective
                  </h4>
                  <div className="flex flex-col space-y-3">
                    <input
                      type="text"
                      value={newObjective.description}
                      onChange={(e) =>
                        setNewObjective({
                          ...newObjective,
                          description: e.target.value,
                        })
                      }
                      placeholder="Objective description"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      disabled={addingObjective}
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={newObjective.status}
                        onChange={(e) =>
                          setNewObjective({
                            ...newObjective,
                            status: e.target
                              .value as keyof typeof OBJECTIVE_STATUS,
                          })
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-sm flex-grow"
                        disabled={addingObjective}
                      >
                        {Object.keys(OBJECTIVE_STATUS).map((s) => (
                          <option key={s} value={s}>
                            {
                              OBJECTIVE_STATUS[
                                s as keyof typeof OBJECTIVE_STATUS
                              ]
                            }
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-1 rounded text-sm font-medium hover:bg-blue-700"
                        disabled={addingObjective}
                      >
                        {addingObjective ? "Adding..." : "Add Objective"}
                      </button>
                    </div>
                  </div>
                </form>

                {/* List of objectives */}
                {objectives.length > 0 ? (
                  <div className="space-y-3">
                    {objectives.map((obj) => (
                      <div
                        key={obj.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">
                              {obj.description}
                            </p>
                            <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                              <span>Created: {obj.createdDate}</span>
                              <span>Updated: {obj.updatedDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={obj.status}
                              onChange={(e) =>
                                handleObjectiveStatusUpdate(
                                  obj.id as number,
                                  e.target.value
                                )
                              }
                              className={`text-xs px-2 py-1 rounded ${
                                obj.status === "COMPLETED"
                                  ? "bg-green-100 text-green-700"
                                  : obj.status === "CANCELLED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                              disabled={objectiveUpdating === obj.id}
                            >
                              {Object.keys(OBJECTIVE_STATUS).map((s) => (
                                <option key={s} value={s}>
                                  {
                                    OBJECTIVE_STATUS[
                                      s as keyof typeof OBJECTIVE_STATUS
                                    ]
                                  }
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() =>
                                handleDeleteObjective(obj.id as number)
                              }
                              className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded"
                              disabled={deletingObjective === obj.id}
                            >
                              {deletingObjective === obj.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">
                    No objectives defined for this task.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Task Logs */}
            <div className="md:w-1/3">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-blue-700 mb-4">
                  Task Logs
                </h3>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 h-96 overflow-y-auto mb-4">
                  {logs.length > 0 ? (
                    <div className="space-y-2">
                      {logs.map((log, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="font-mono text-xs text-gray-500">
                            [{log.date}]
                          </span>
                          <p className="ml-1">{log.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm text-center my-4">
                      No logs available for this task.
                    </p>
                  )}
                </div>

                <form
                  onSubmit={handleLogSubmit}
                  className="flex flex-col gap-2"
                >
                  <input
                    type="text"
                    value={logMsg}
                    onChange={(e) => setLogMsg(e.target.value)}
                    placeholder="Add log message..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 w-full"
                  >
                    Add Log
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
