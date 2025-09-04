# Database Issue Fix Guide

## Issue Encountered

The error message `Table 'pdpsipa_tasks.objective' doesn't exist` indicates that while we've defined the Objective model in the Prisma schema, the actual database table hasn't been created yet.

## Steps to Fix

1. **Create the migration file** (already done):

   We've already created a migration file at: `prisma/migrations/20250903101234_add_objectives/migration.sql`

2. **Apply the migration to create the table in the database**:

   Run the following command in your terminal:

   ```bash
   npx prisma migrate dev
   ```

   This will create the Objective table in your database.

3. **Regenerate the Prisma client**:

   ```bash
   npx prisma generate
   ```

   This will update the Prisma client to include the new `objective` model.

4. **Restore the original code**:

   After completing the steps above, you can restore the original functionality in `actions.ts` by:

   - Uncommenting the objectives creation code in the `createTask` function
   - Restoring the SQL queries in the `fetchTaskDetail` function
   - Re-implementing the objective-related functions

## Original Code to Restore

Once the database is updated, you can restore the original implementation:

### For fetchTaskDetail:

```typescript
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

  // Manually fetch objectives using raw SQL
  const objectives = await prisma.$queryRaw`
    SELECT id, description, status, createdDate, updatedDate
    FROM Objective
    WHERE taskId = ${taskId}
  `;

  // Return combined data
  return {
    ...task,
    objectives: objectives || [],
  };
}
```

### For addObjective:

```typescript
export async function addObjective(
  taskId: number,
  objective: { description: string; status: string }
) {
  // Using raw SQL to insert objective
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

  // Return basic confirmation object
  return { success: true };
}
```

## Alternative: Using Prisma Client Directly

Once the Prisma client is regenerated, you can also switch to using the proper Prisma client API instead of raw SQL:

```typescript
export async function addObjective(
  taskId: number,
  objective: { description: string; status: string }
) {
  return await prisma.objective.create({
    data: {
      taskId,
      description: objective.description,
      status: objective.status,
    },
  });
}

export async function updateObjectiveStatus(id: number, status: string) {
  return await prisma.objective.update({
    where: { id },
    data: { status },
  });
}

export async function deleteObjective(id: number) {
  return await prisma.objective.delete({
    where: { id },
  });
}
```

## Verifying the Fix

After applying these changes, you should be able to:

1. Create tasks with objectives
2. View tasks with their associated objectives
3. Add, update, and delete objectives for a task
