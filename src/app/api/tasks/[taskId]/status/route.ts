import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;
  const { status } = await request.json();

  try {
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: { status },
    });
    return NextResponse.json(updatedTask);
  } catch {
    return NextResponse.json({ message: "Error updating task" }, { status: 500 });
  }
}
