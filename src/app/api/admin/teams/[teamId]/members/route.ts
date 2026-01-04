import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { logTeamMemberAdded, logTeamMemberRemoved } from "@/lib/audit";
import { NextResponse } from "next/server";
import { UserRole } from "@/lib/rbac/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { teamId } = await params;

  const { data: members, error } = await supabase
    .from("user_teams")
    .select(`
      id,
      user_id,
      role,
      is_active,
      users (username, email)
    `)
    .eq("team_id", parseInt(teamId));

  if (error) {
    return NextResponse.json(
      { message: `Error fetching team members: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json(members);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { teamId } = await params;
  const body = await request.json();

  const { data: existingMember, error: checkError } = await supabase
    .from("user_teams")
    .select()
    .eq("user_id", body.userId)
    .eq("team_id", parseInt(teamId))
    .single();

  if (checkError) {
    return NextResponse.json(
      { message: `Error checking existing membership: ${checkError.message}` },
      { status: 500 }
    );
  }

  if (existingMember) {
    const { data, error: updateError } = await supabase
      .from("user_teams")
      .update({ role: body.role || UserRole.Member })
      .eq("id", existingMember.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { message: `Error updating team member: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  }

  const { data: newMember, error } = await supabase.from("user_teams").insert({
    user_id: body.userId,
    team_id: parseInt(teamId),
    role: body.role || UserRole.Member,
  }).select().single();

  if (error) {
    return NextResponse.json(
      { message: `Error adding team member: ${error.message}` },
      { status: 500 }
    );
  }

  await logTeamMemberAdded(admin.id, parseInt(teamId), body.userId, body.role || UserRole.Member);

  return NextResponse.json(newMember, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { teamId } = await params;
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");

  if (!memberId) {
    return NextResponse.json({ message: "memberId is required" }, { status: 400 });
  }

  const { data: existingMember, error: fetchError } = await supabase
    .from("user_teams")
    .select("user_id")
    .eq("id", parseInt(memberId))
    .single();

  if (fetchError || !existingMember) {
    return NextResponse.json({ message: "Team member not found" }, { status: 404 });
  }

  await supabase.from("user_teams").delete().eq("id", parseInt(memberId));

  await logTeamMemberRemoved(admin.id, parseInt(teamId), existingMember.user_id);

  return NextResponse.json({ message: "Team member removed successfully" });
}
