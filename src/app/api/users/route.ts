import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("user_id", { ascending: true });

  if (error) {
    return NextResponse.json(
      { message: `Error retrieving users: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json(users);
}
