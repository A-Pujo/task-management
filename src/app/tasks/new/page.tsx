"use client";
import { useState, useEffect } from "react";
import { TASK_STATUS, OBJECTIVE_STATUS } from "../../../lib/constants";
import { createTask } from "../../../lib/actions";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { showError, showSuccess } from "../../../components/AlertProvider";

export default function NewTaskPage() {
  const [name, setName] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("NEW");
  const [desc, setDesc] = useState("");
  const [objectives, setObjectives] = useState<
    {
      description: string;
      status: string;
    }[]
  >([{ description: "", status: "ONGOING" }]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize database on component load
  useEffect(() => {
    // Import dynamically to avoid breaking the client component
    import("../../../lib/actions").then(({ initializeDatabase }) => {
      // Initialize the database
      initializeDatabase()
        .then(() => {
          console.log("Database initialized");
        })
        .catch((err) => {
          console.error("Failed to initialize database:", err);
        });
    });
  }, []);

  const handleObjectiveChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedObjectives = [...objectives];
    updatedObjectives[index] = {
      ...updatedObjectives[index],
      [field]: value,
    };
    setObjectives(updatedObjectives);
  };

  const addObjective = () => {
    setObjectives([...objectives, { description: "", status: "ONGOING" }]);
  };

  const removeObjective = (index: number) => {
    if (objectives.length > 1) {
      const updatedObjectives = objectives.filter((_, i) => i !== index);
      setObjectives(updatedObjectives);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Filter out empty objectives
      const filteredObjectives = objectives.filter(
        (obj) => obj.description.trim() !== ""
      );

      // Store if we have objectives to warn about them if needed
      const hasObjectives = filteredObjectives.length > 0;

      const createdTask = await createTask({
        name,
        inputDate,
        deadline,
        status,
        description: desc,
        objectives: filteredObjectives,
      });

      setSuccess(true);
      setName("");
      setInputDate("");
      setDeadline("");
      setStatus("NEW");
      setDesc("");
      setObjectives([{ description: "", status: "ONGOING" }]);

      if (hasObjectives) {
        showSuccess(
          "Task created successfully! Note that objectives might not be saved until database migration is run."
        );
      } else {
        showSuccess("Task created successfully!");
      }
    } catch (err) {
      console.error("Error creating task:", err);
      setError("Failed to create task");
      showError("Failed to create task");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
      {/* Fixed Top Bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-10 px-6 py-4 flex items-center">
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
          <h2 className="text-xl font-bold text-blue-700">New Task</h2>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-8">
            {/* Database Auto-Setup Banner */}
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800 text-sm">
              <h3 className="font-semibold mb-1">✅ Auto Database Setup</h3>
              <p>
                The objective functionality is now automatically set up. You can
                add objectives to your tasks without manual database setup.
              </p>
              <p className="text-xs italic mt-1">
                Note: For production use, you should still run proper
                migrations.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                id="taskName"
                placeholder="Task Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                required
              />
              <input
                type="date"
                id="inputDate"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                required
              />
              <input
                type="date"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                required
              />
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
              >
                {Object.keys(TASK_STATUS).map((s) => (
                  <option key={s} value={s}>
                    {TASK_STATUS[s as keyof typeof TASK_STATUS]}
                  </option>
                ))}
              </select>
              <textarea
                id="desc"
                placeholder="Description (optional)"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
                rows={3}
              />

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    Objectives
                  </h3>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={addObjective}
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                    >
                      + Add Objective
                    </button>
                  </div>
                </div>

                {objectives.map((objective, index) => (
                  <div
                    key={index}
                    className="mb-2 border border-gray-200 rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-medium text-gray-500">
                        Objective {index + 1}
                      </h4>
                      {objectives.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeObjective(index)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <textarea
                      placeholder="Objective description"
                      value={objective.description}
                      onChange={(e) =>
                        handleObjectiveChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full mb-2 border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm resize-none"
                      rows={2}
                    />

                    <select
                      value={objective.status}
                      onChange={(e) =>
                        handleObjectiveChange(index, "status", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                    >
                      {Object.keys(OBJECTIVE_STATUS).map((s) => (
                        <option key={s} value={s}>
                          {OBJECTIVE_STATUS[s as keyof typeof OBJECTIVE_STATUS]}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-2 mt-4 rounded-full bg-blue-600 text-white font-semibold text-sm shadow hover:bg-blue-700 transition"
              >
                Create Task
              </button>
              {success && (
                <div className="text-green-600 bg-green-50 border border-green-200 rounded p-2 text-center mt-2">
                  Task created successfully!
                </div>
              )}
              {error && (
                <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center mt-2">
                  {error}
                </div>
              )}
              {loading && <LoadingOverlay />}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
