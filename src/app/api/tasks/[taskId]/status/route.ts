import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const supabase = await createClient();
  const { taskId } = await params;
  const { status } = await request.json();

  const { data: updatedTask, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", parseInt(taskId))
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { message: `Error updating task: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json(updatedTask);
}
