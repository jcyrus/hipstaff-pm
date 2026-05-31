import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  let currentUser;
  try {
    currentUser = await requireAuth();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;
  const { status } = await request.json();

  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
      select: {
        authorUserId: true,
        taskAssignments: { select: { userId: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const isAuthor = task.authorUserId === currentUser.id;
    const isAssignee = task.taskAssignments.some((a) => a.userId === currentUser.id);

    if (!isAuthor && !isAssignee) {
      return NextResponse.json({ message: "Forbidden: you are not the author or assignee of this task" }, { status: 403 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: { status },
    });
    return NextResponse.json(updatedTask);
  } catch {
    return NextResponse.json({ message: "Error updating task" }, { status: 500 });
  }
}
