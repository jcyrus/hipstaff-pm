import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json({ message: "Error retrieving projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { name, description, startDate, endDate } = await request.json();

  try {
    const newProject = await prisma.project.create({
      data: {
        name,
        description: description ?? null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    return NextResponse.json(newProject, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Error creating project" }, { status: 500 });
  }
}
