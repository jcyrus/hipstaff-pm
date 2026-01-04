import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: teams, error } = await supabase
    .from("teams")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json(
      { message: `Error retrieving teams: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json(teams);
}
