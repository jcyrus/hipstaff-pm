import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";
import { logUserCreated, logUserUpdated, logUserRoleChanged, logUserActivated, logUserDeactivated } from "@/lib/audit";
import { NextResponse } from "next/server";
import { UserRole } from "@/lib/rbac/types";

export async function GET() {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("users")
    .select(`
      user_id,
      supabase_user_id,
      username,
      email,
      role,
      is_active,
      created_at,
      profile_picture_url,
      user_teams (
        team_id,
        teams (team_name),
        role
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: `Error fetching users: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  let superAdmin;
  try {
    superAdmin = await requireSuperAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const body = await request.json();

  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: {
      username: body.username,
    },
  });

  if (error || !newUser?.user) {
    return NextResponse.json(
      { message: `Error creating auth user: ${error?.message || "Unknown error"}` },
      { status: 400 }
    );
  }

  const { data: userData, error: dbError } = await supabase.from("users").insert({
    supabase_user_id: newUser.user.id,
    username: body.username,
    email: body.email,
    role: body.role || UserRole.Member,
    is_active: body.isActive !== false,
  }).select().single();

  if (dbError) {
    await supabase.auth.admin.deleteUser(newUser.user.id);
    return NextResponse.json(
      { message: `Error creating user record: ${dbError.message}` },
      { status: 500 }
    );
  }

  await logUserCreated(superAdmin.id, userData.user_id, {
    username: body.username,
    email: body.email,
    role: body.role,
  });

  return NextResponse.json(userData, { status: 201 });
}

export async function PATCH(request: Request) {
  let superAdmin;
  try {
    superAdmin = await requireSuperAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const body = await request.json();
  const { userId, ...updates } = body;

  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("user_id", userId)
    .single();

  if (fetchError || !existingUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (updates.role && updates.role !== existingUser.role) {
    await logUserRoleChanged(superAdmin.id, userId, existingUser.role, updates.role);
  }

  if (updates.is_active !== undefined && updates.is_active !== existingUser.is_active) {
    if (updates.is_active) {
      await logUserActivated(superAdmin.id, userId);
    } else {
      await logUserDeactivated(superAdmin.id, userId);
    }
  }

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { message: `Error updating user: ${error.message}` },
      { status: 500 }
    );
  }

  await logUserUpdated(superAdmin.id, userId, updates);

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ message: "userId is required" }, { status: 400 });
  }

  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("supabase_user_id, role")
    .eq("user_id", parseInt(userId))
    .single();

  if (fetchError || !user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  await supabase.from("users").delete().eq("user_id", parseInt(userId));

  await supabase.auth.admin.deleteUser(user.supabase_user_id);

  return NextResponse.json({ message: "User deleted successfully" });
}
