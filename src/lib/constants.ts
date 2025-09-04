// Dummy user for login
export const DUMMY_USER = {
  username: "pdpsipa",
  password: "banteng1001#",
};

// Task status types
export const TASK_STATUS = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  CRITICAL: "Critical",
  DONE: "Done",
};

// Objective status types
export const OBJECTIVE_STATUS = {
  ONGOING: "On Going",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export type Objective = {
  id?: number;
  description: string;
  status: keyof typeof OBJECTIVE_STATUS;
  createdDate: string;
  updatedDate: string;
};

export type Task = {
  id: number;
  name: string;
  inputDate: string;
  deadline: string;
  status: keyof typeof TASK_STATUS;
  description?: string;
  objectives?: Objective[];
};
