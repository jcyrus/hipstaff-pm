import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { message: "projectId is required" },
      { status: 400 }
    );
  }

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      author:users!tasks_author_user_id_fkey(*),
      assignee:users!tasks_assigned_user_id_fkey(*),
      comments(*),
      attachments(*)
    `
    )
    .eq("project_id", parseInt(projectId));

  if (error) {
    return NextResponse.json(
      { message: `Error retrieving tasks: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data: newTask, error } = await supabase
    .from("tasks")
    .insert({
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      tags: body.tags,
      start_date: body.startDate,
      due_date: body.dueDate,
      points: body.points,
      project_id: body.projectId,
      author_user_id: body.authorUserId,
      assigned_user_id: body.assignedUserId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { message: `Error creating a task: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json(newTask, { status: 201 });
}
