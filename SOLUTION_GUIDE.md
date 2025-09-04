# Solution Guide: Implementing Objective Model

## Issue Overview

The application has been updated to include an Objective model in the Prisma schema, but the Prisma client needs to be regenerated to recognize it. In the meantime, we've implemented a temporary solution using raw SQL queries.

## Steps to Fix the Issue

1. **Regenerate the Prisma client**:

   ```bash
   npx prisma generate
   ```

   This will update the Prisma client to include the new `objective` model.

2. **Run database migrations** (if needed):

   ```bash
   npx prisma migrate dev
   ```

3. **After regenerating the client**, we can revert the workaround code in `actions.ts` to use the proper Prisma client API.

## Temporary Solution Implemented

While waiting for the Prisma client to be regenerated, we've implemented:

1. Raw SQL queries in `actions.ts` to:

   - Create objectives during task creation
   - Fetch objectives for a task
   - Add, update, and delete objectives

2. Added a migration file for the Objective model

## Final Code Structure (After Fixing)

Once the Prisma client is regenerated, you should:

1. Update the `createTask` function to use:

   ```typescript
   return await prisma.task.create({
     data: {
       name: task.name,
       inputDate: new Date(task.inputDate),
       deadline: new Date(task.deadline),
       status: task.status,
       description: task.description || null,
       objectives: {
         create:
           task.objectives
             ?.filter((obj) => obj.description.trim() !== "")
             .map((obj) => ({
               description: obj.description,
               status: obj.status || "ONGOING",
             })) || [],
       },
     },
     include: {
       objectives: true,
     },
   });
   ```

2. Update the `fetchTaskDetail` function to use:

   ```typescript
   export async function fetchTaskDetail(id: string) {
     const taskId = parseInt(id);

     if (isNaN(taskId)) {
       throw new Error("Invalid task ID");
     }

     const task = await prisma.task.findUnique({
       where: { id: taskId },
       include: {
         objectives: true,
       },
     });

     return task;
   }
   ```

3. Update the objective-related functions to use the Prisma client API:

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

## Model Structure

The Objective model has the following structure:

```prisma
model Objective {
  id          Int      @id @default(autoincrement())
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  taskId      Int
  description String
  status      String   @default("ONGOING")
  createdDate DateTime @default(now())
  updatedDate DateTime @updatedAt
}
```

## UI Integration

The UI already handles objectives with:

1. A form for adding objectives in the task creation page
2. A display of objectives in the task view page
3. Functions for adding, updating, and deleting objectives

## Testing

After implementing these fixes:

1. Try creating a new task with objectives
2. View a task and check if objectives are displayed correctly
3. Add, update, and delete objectives from a task
