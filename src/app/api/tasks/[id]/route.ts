import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";

// DELETE /api/tasks/[id] - delete a task
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  try {
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2003") {
      // Foreign key constraint failed (logs exist)
      return NextResponse.json(
        { error: "Cannot delete task with logs. Please delete logs first." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err.message || "Delete failed" },
      { status: 500 }
    );
  }
}

// GET /api/tasks/[id] - get task detail
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const task = await prisma.task.findUnique({
    where: { id },
    include: { logs: true },
  });
  if (!task)
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json(task);
}

// POST /api/tasks/[id]/logs - add a log to a task
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const body = await req.json();
  const log = await prisma.log.create({
    data: {
      taskId: id,
      date: new Date(body.date),
      message: body.message,
    },
  });
  return NextResponse.json({ id: log.id });
}
