import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const supabase = await createClient();
  const { userId } = await params;

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      author:users!tasks_author_user_id_fkey(*),
      assignee:users!tasks_assigned_user_id_fkey(*)
    `
    )
    .or(`author_user_id.eq.${userId},assigned_user_id.eq.${userId}`);

  if (error) {
    return NextResponse.json(
      { message: `Error retrieving user's tasks: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json(tasks);
}
