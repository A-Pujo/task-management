import prisma from "../../../lib/prisma";
import { NextResponse } from "next/server";

// GET /api/tasks - list all tasks
export async function GET() {
  const tasks = await prisma.task.findMany();
  return NextResponse.json(tasks);
}

// POST /api/tasks - create a new task
export async function POST(req: Request) {
  const body = await req.json();
  const task = await prisma.task.create({
    data: {
      name: body.name,
      inputDate: new Date(body.inputDate),
      deadline: new Date(body.deadline),
      status: body.status,
      description: body.description || null,
    },
  });
  return NextResponse.json({ id: task.id });
}
