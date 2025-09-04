import prisma from "../../../../../lib/prisma";
import { NextResponse } from "next/server";

// PUT /api/tasks/[id]/status - update task status
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const body = await req.json();
  const updated = await prisma.task.update({
    where: { id },
    data: { status: body.status },
  });
  return NextResponse.json(updated);
}
