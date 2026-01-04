import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { logTeamCreated, logTeamUpdated, logTeamDeleted } from "@/lib/audit";
import { NextResponse } from "next/server";
import { UserRole } from "@/lib/rbac/types";

export async function GET() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data: teams, error } = await supabase
    .from("teams")
    .select(`
      id,
      team_name,
      product_owner_user_id,
      project_manager_user_id,
      created_by,
      created_at,
      user_teams (
        user_id,
        users (username, email)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: `Error fetching teams: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json(teams);
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const body = await request.json();

  const { data: newTeam, error } = await supabase.from("teams").insert({
    team_name: body.name,
    product_owner_user_id: body.productOwnerId || null,
    project_manager_user_id: body.projectManagerUserId || null,
    created_by: admin.id,
  }).select().single();

  if (error) {
    return NextResponse.json(
      { message: `Error creating team: ${error.message}` },
      { status: 500 }
    );
  }

  await logTeamCreated(admin.id, newTeam.id, {
    name: body.name,
    productOwner: body.productOwnerId,
    projectManager: body.projectManagerUserId,
  });

  return NextResponse.json(newTeam, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const body = await request.json();
  const { teamId, ...updates } = body;

  const { data, error } = await supabase
    .from("teams")
    .update({
      team_name: updates.name,
      product_owner_user_id: updates.productOwnerId,
      project_manager_user_id: updates.projectManagerUserId,
    })
    .eq("id", teamId)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { message: `Error updating team: ${error.message}` },
      { status: 500 }
    );
  }

  await logTeamUpdated(admin.id, teamId, updates);

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json({ message: "teamId is required" }, { status: 400 });
  }

  const { error: fetchError } = await supabase
    .from("teams")
    .select("id")
    .eq("id", parseInt(teamId))
    .single();

  if (fetchError) {
    return NextResponse.json({ message: "Team not found" }, { status: 404 });
  }

  await supabase.from("teams").delete().eq("id", parseInt(teamId));

  await logTeamDeleted(admin.id, parseInt(teamId));

  return NextResponse.json({ message: "Team deleted successfully" });
}
