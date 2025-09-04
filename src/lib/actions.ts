"use server";

import prisma from "./prisma";

// Helper function to check if a table exists
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const tables = await prisma.$queryRaw`SHOW TABLES LIKE ${tableName}`;
    return Array.isArray(tables) && tables.length > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Initialize the database structure
export async function initializeDatabase() {
  try {
    // Check and create Objective table if it doesn't exist
    const objectiveTableExists = await checkTableExists("Objective");

    if (!objectiveTableExists) {
      console.log("Creating Objective table...");
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS Objective (
          id INT AUTO_INCREMENT PRIMARY KEY,
          taskId INT NOT NULL,
          description VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'ONGOING',
          createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (taskId) REFERENCES Task(id) ON DELETE CASCADE
        )
      `;
      console.log("Objective table created successfully");
    }

    return { success: true, message: "Database initialized successfully" };
  } catch (error) {
    console.error("Error initializing database:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createTask(task: {
  name: string;
  inputDate: string;
  deadline: string;
  status: string;
  description?: string;
  objectives?: { description: string; status?: string }[];
}) {
  // Create the task without objectives first
  const createdTask = await prisma.task.create({
    data: {
      name: task.name,
      inputDate: new Date(task.inputDate),
      deadline: new Date(task.deadline),
      status: task.status,
      description: task.description || null,
    },
  });

  // Skip creating objectives for now since the table doesn't exist yet
  // We'll implement this after running migrations
  // if (task.objectives && task.objectives.length > 0) {
  //   const filteredObjectives = task.objectives.filter(
  //     (obj) => obj.description.trim() !== ""
  //   );
  //
  //   // Create objectives one by one using prisma.$executeRaw
  //   for (const obj of filteredObjectives) {
  //     await prisma.$executeRaw`
  //       INSERT INTO Objective (taskId, description, status, createdDate, updatedDate)
  //       VALUES (
  //         ${createdTask.id},
  //         ${obj.description},
  //         ${obj.status || "ONGOING"},
  //         NOW(),
  //         NOW()
  //       )
  //     `;
  //   }
  // }

  return createdTask;
}

export async function fetchTasks() {
  return await prisma.task.findMany();
}

export async function fetchTaskDetail(id: string) {
  // Convert id to number
  const taskId = parseInt(id);

  if (isNaN(taskId)) {
    throw new Error("Invalid task ID");
  }

  // Fetch task without objectives first
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) return null;

  // Check if the Objective table exists
  let objectives = [];
  try {
    // Try to check if the table exists
    const tables = await prisma.$queryRaw`SHOW TABLES LIKE 'Objective'`;
    const tableExists = Array.isArray(tables) && tables.length > 0;

    if (tableExists) {
      // If table exists, fetch objectives
      const result = await prisma.$queryRaw`
        SELECT id, description, status, createdDate, updatedDate
        FROM Objective
        WHERE taskId = ${taskId}
      `;
      objectives = Array.isArray(result) ? result : [];
    }
  } catch (error) {
    console.log("Error checking or fetching objectives:", error);
    // Continue with empty objectives
  }

  // Return combined data
  return {
    ...task,
    objectives: objectives || [],
  };
}

export async function updateTaskStatus(id: number, status: string) {
  return await prisma.task.update({
    where: { id },
    data: { status },
  });
}

export async function deleteTask(id: number) {
  return await prisma.task.delete({
    where: { id },
  });
}

export async function addTaskLog(id: number, message: string) {
  const now = new Date();
  return await prisma.log.create({
    data: {
      taskId: id,
      date: now,
      message,
    },
  });
}

// Implementing the objective-related functions
export async function addObjective(
  taskId: number,
  objective: { description: string; status: string }
) {
  try {
    // First, check if the Objective table exists
    let tableExists = false;
    try {
      // Try to query the table
      await prisma.$queryRaw`SHOW TABLES LIKE 'Objective'`;
      tableExists = true;
    } catch (error) {
      console.log("Objective table doesn't exist yet");
      tableExists = false;
    }

    // If table doesn't exist, create it
    if (!tableExists) {
      console.log("Creating Objective table...");
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS Objective (
          id INT AUTO_INCREMENT PRIMARY KEY,
          taskId INT NOT NULL,
          description VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'ONGOING',
          createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (taskId) REFERENCES Task(id) ON DELETE CASCADE
        )
      `;
      console.log("Objective table created successfully");
    }

    // Now insert the objective
    await prisma.$executeRaw`
      INSERT INTO Objective (taskId, description, status, createdDate, updatedDate) 
      VALUES (
        ${taskId}, 
        ${objective.description}, 
        ${objective.status}, 
        NOW(), 
        NOW()
      )
    `;

    // Get the ID of the last inserted record
    const result = await prisma.$queryRaw`SELECT LAST_INSERT_ID() as id`;
    const id = Array.isArray(result) ? result[0].id : null;

    return {
      success: true,
      id,
      description: objective.description,
      status: objective.status,
      createdDate: new Date(),
      updatedDate: new Date(),
    };
  } catch (error) {
    console.error("Error in addObjective:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateObjectiveStatus(id: number, status: string) {
  try {
    // First, check if the Objective table exists
    let tableExists = false;
    try {
      // Try to query the table
      await prisma.$queryRaw`SHOW TABLES LIKE 'Objective'`;
      tableExists = true;
    } catch (error) {
      console.log("Objective table doesn't exist yet");
      return { success: false, message: "Objective table doesn't exist yet" };
    }

    if (tableExists) {
      // Update the objective status
      await prisma.$executeRaw`
        UPDATE Objective
        SET status = ${status}, updatedDate = NOW()
        WHERE id = ${id}
      `;
      return { success: true };
    } else {
      return { success: false, message: "Objective table doesn't exist yet" };
    }
  } catch (error) {
    console.error("Error in updateObjectiveStatus:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteObjective(id: number) {
  try {
    // First, check if the Objective table exists
    let tableExists = false;
    try {
      // Try to query the table
      await prisma.$queryRaw`SHOW TABLES LIKE 'Objective'`;
      tableExists = true;
    } catch (error) {
      console.log("Objective table doesn't exist yet");
      return { success: false, message: "Objective table doesn't exist yet" };
    }

    if (tableExists) {
      // Delete the objective
      await prisma.$executeRaw`
        DELETE FROM Objective
        WHERE id = ${id}
      `;
      return { success: true };
    } else {
      return { success: false, message: "Objective table doesn't exist yet" };
    }
  } catch (error) {
    console.error("Error in deleteObjective:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
