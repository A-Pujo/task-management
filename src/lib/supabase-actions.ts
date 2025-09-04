"use server";

import { supabase } from "./supabase-client";
import { revalidatePath } from "next/cache";

// Types
import type { Task, Objective } from "./constants";

/**
 * Fetch all tasks
 */
export async function fetchTasks() {
  try {
    const { data, error } = await supabase.from("Task").select("*");

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

/**
 * Fetch task detail by ID including objectives and logs
 */
export async function fetchTaskDetail(id: string) {
  try {
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      throw new Error("Invalid task ID");
    }

    // Fetch the task
    const { data: task, error: taskError } = await supabase
      .from("Task")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskError) throw taskError;
    if (!task) return null;

    // Fetch objectives
    const { data: objectives, error: objectivesError } = await supabase
      .from("Objective")
      .select("*")
      .eq("taskId", taskId);

    if (objectivesError) throw objectivesError;

    // Fetch logs
    const { data: logs, error: logsError } = await supabase
      .from("Log")
      .select("*")
      .eq("taskId", taskId);

    if (logsError) throw logsError;

    // Return the combined data
    return {
      ...task,
      objectives: objectives || [],
      logs: logs || [],
    };
  } catch (error) {
    console.error("Error fetching task detail:", error);
    throw error;
  }
}

/**
 * Create a new task
 */
export async function createTask(task: {
  name: string;
  inputDate: string;
  deadline: string;
  status: string;
  description?: string;
  objectives?: { description: string; status?: string }[];
}) {
  try {
    // Insert task
    const { data: createdTask, error: taskError } = await supabase
      .from("Task")
      .insert({
        name: task.name,
        inputDate: task.inputDate,
        deadline: task.deadline,
        status: task.status,
        description: task.description,
      })
      .select()
      .single();

    if (taskError) throw taskError;

    // Insert objectives if provided
    if (task.objectives && task.objectives.length > 0 && createdTask.id) {
      const objectivesToInsert = task.objectives.map((obj) => ({
        taskId: createdTask.id,
        description: obj.description,
        status: obj.status || "ONGOING",
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      }));

      const { error: objectivesError } = await supabase
        .from("Objective")
        .insert(objectivesToInsert);

      if (objectivesError) throw objectivesError;
    }

    revalidatePath("/dashboard");
    revalidatePath("/tasks");

    return createdTask;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

/**
 * Add a log to a task
 */
export async function addTaskLog(taskId: number, message: string) {
  try {
    const { error } = await supabase.from("Log").insert({
      taskId,
      message,
      date: new Date().toISOString(),
    });

    if (error) throw error;

    revalidatePath(`/tasks/${taskId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding task log:", error);
    throw error;
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(taskId: number, newStatus: string) {
  try {
    const { error } = await supabase
      .from("Task")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (error) throw error;

    revalidatePath(`/tasks/${taskId}`);
    revalidatePath("/dashboard");
    revalidatePath("/tasks");

    return { success: true };
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: number) {
  try {
    const { error } = await supabase.from("Task").delete().eq("id", taskId);

    if (error) throw error;

    revalidatePath("/dashboard");
    revalidatePath("/tasks");

    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}

/**
 * Add an objective to a task
 */
export async function addObjective(
  taskId: number,
  objective: { description: string; status: string }
) {
  try {
    const { error } = await supabase.from("Objective").insert({
      taskId,
      description: objective.description,
      status: objective.status,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    });

    if (error) throw error;

    revalidatePath(`/tasks/${taskId}`);

    return { success: true };
  } catch (error) {
    console.error("Error adding objective:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update objective status
 */
export async function updateObjectiveStatus(
  objectiveId: number,
  newStatus: string
) {
  try {
    const { data, error } = await supabase
      .from("Objective")
      .update({
        status: newStatus,
        updatedDate: new Date().toISOString(),
      })
      .eq("id", objectiveId)
      .select("taskId")
      .single();

    if (error) throw error;

    if (data?.taskId) {
      revalidatePath(`/tasks/${data.taskId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating objective status:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete an objective
 */
export async function deleteObjective(objectiveId: number) {
  try {
    const { data, error } = await supabase
      .from("Objective")
      .delete()
      .eq("id", objectiveId)
      .select("taskId")
      .single();

    if (error) throw error;

    if (data?.taskId) {
      revalidatePath(`/tasks/${data.taskId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting objective:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Initialize database tables
 * This is just a placeholder function for compatibility with the existing code
 * Supabase already handles table creation through migrations
 */
export async function initializeDatabase() {
  // For Supabase, we typically don't need to do this manually as tables are managed through migrations
  // This function is kept for API compatibility
  return { success: true, message: "Database is managed by Supabase" };
}
