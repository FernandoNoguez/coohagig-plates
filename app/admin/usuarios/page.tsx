import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminUsersClient from "./users-client";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "admin") {
    redirect("/plates");
  }

  return <AdminUsersClient />;
}
