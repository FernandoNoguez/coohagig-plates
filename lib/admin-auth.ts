import { auth } from "@/auth";

export async function getAdminSession() {
  const session = await auth();

  if (!session?.user) {
    return { error: "Não autorizado.", status: 401 } as const;
  }

  if (session.user.role !== "admin") {
    return { error: "Acesso restrito ao administrador.", status: 403 } as const;
  }

  return { session } as const;
}
