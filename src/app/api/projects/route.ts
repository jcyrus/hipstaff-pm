import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json(
      { message: `Error retrieving projects: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { name, description, startDate, endDate } = await request.json();

  const { data: newProject, error } = await supabase
    .from("projects")
    .insert({ name, description, start_date: startDate, end_date: endDate })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { message: `Error creating a project: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json(newProject, { status: 201 });
}
