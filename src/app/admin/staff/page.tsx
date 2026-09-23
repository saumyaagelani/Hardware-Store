import type { Metadata } from "next";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { AdminHeader } from "@/components/admin/ui";
import { StaffManager, type StaffRow } from "@/components/admin/staff-manager";

export const metadata: Metadata = { title: "Staff & permissions" };

export default async function StaffPage() {
  const me = await requireStaff();
  const staff: StaffRow[] = getDb()
    .users.filter((u) => u.role === "admin" || u.role === "staff")
    .map((u) => ({ id: u.id, fullName: u.fullName, email: u.email, role: u.role as "admin" | "staff", permissions: u.staffPermissions ?? [], lastLoginAt: u.lastLoginAt }));
  return (
    <>
      <AdminHeader title="Staff & permissions" description="Basic role-based access: administrators have full access; staff see only the sections they're permitted to. Permissions are enforced on the server." />
      <StaffManager staff={staff} meId={me.id} canManage={me.role === "admin"} />
    </>
  );
}
