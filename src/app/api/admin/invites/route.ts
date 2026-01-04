import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { logInviteCreated, logInviteAccepted, logInviteRevoked } from "@/lib/audit";
import { NextResponse } from "next/server";
import { UserRole } from "@/lib/rbac/types";
import { addDays } from "date-fns";

export async function GET() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data: invites, error } = await supabase
    .from("invites")
    .select(`
      id,
      token,
      email,
      team_id,
      role,
      expires_at,
      accepted_at,
      revoked_at,
      created_by,
      teams (team_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: `Error fetching invites: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json(invites);
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const body = await request.json();

  const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  const expiresAt = addDays(new Date(), 7);

  const { data: invite, error } = await supabase.from("invites").insert({
    token,
    email: body.email,
    team_id: body.teamId,
    role: body.role || UserRole.Member,
    created_by: admin.id,
    expires_at: expiresAt.toISOString(),
  }).select().single();

  if (error) {
    return NextResponse.json(
      { message: `Error creating invite: ${error.message}` },
      { status: 500 }
    );
  }

  await logInviteCreated(admin.id, body.email, body.teamId, body.role || UserRole.Member);

  return NextResponse.json({
    inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite?token=${token}`,
    expiresAt,
  }, { status: 201 });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const inviteId = searchParams.get("inviteId");

  if (!inviteId) {
    return NextResponse.json({ message: "inviteId is required" }, { status: 400 });
  }

  const { data: invite, error: fetchError } = await supabase
    .from("invites")
    .select()
    .eq("id", parseInt(inviteId))
    .single();

  if (fetchError || !invite) {
    return NextResponse.json({ message: "Invite not found" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", parseInt(inviteId));

  if (updateError) {
    return NextResponse.json(
      { message: `Error revoking invite: ${updateError.message}` },
      { status: 500 }
    );
  }

  await logInviteRevoked(admin.id, parseInt(inviteId));

  return NextResponse.json({ message: "Invite revoked successfully" });
}
