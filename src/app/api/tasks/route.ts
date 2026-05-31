import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ message: "projectId is required" }, { status: 400 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: parseInt(projectId) },
      include: {
        author: true,
        assignee: true,
        comments: true,
        attachments: true,
      },
    });
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json({ message: "Error retrieving tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  try {
    const newTask = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        status: body.status ?? null,
        priority: body.priority ?? null,
        tags: body.tags ?? null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        points: body.points ?? null,
        projectId: body.projectId,
        authorUserId: user.id,
        assignedUserId: body.assignedUserId ?? null,
      },
    });
    return NextResponse.json(newTask, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Error creating task" }, { status: 500 });
  }
}
