import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { message: "Search query is required" },
      { status: 400 }
    );
  }

  const searchPattern = `%${query}%`;

  const [tasksResult, projectsResult, usersResult] = await Promise.all([
    supabase.from("tasks").select("*").ilike("title", searchPattern),
    supabase.from("projects").select("*").ilike("name", searchPattern),
    supabase.from("users").select("*").ilike("username", searchPattern),
  ]);

  if (tasksResult.error || projectsResult.error || usersResult.error) {
    return NextResponse.json(
      { message: "Error performing search" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    tasks: tasksResult.data,
    projects: projectsResult.data,
    users: usersResult.data,
  });
}
