import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  deleteUserById,
  findPublicUserById,
  findUserByEmail,
  findUserByUsername,
  updateUserById,
  type UserRole,
} from "@/lib/users";
import { getAdminSession } from "@/lib/admin-auth";

function parseRole(value: string): UserRole {
  return value === "admin" ? "admin" : "user";
}

function isValidObjectId(id: string) {
  return ObjectId.isValid(id);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await getAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    const userBefore = await findPublicUserById(id);
    if (!userBefore) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const body = await request.json();

    const nextUser = String(body?.user ?? userBefore.user).trim();
    const nextEmail = String(body?.email ?? userBefore.email).trim().toLowerCase();
    const nextRole = parseRole(String(body?.role ?? userBefore.role));
    const nextIsActive = Boolean(body?.isActive);

    if (!nextUser || !nextEmail) {
      return NextResponse.json({ error: "Usuário e e-mail são obrigatórios." }, { status: 400 });
    }

    const byUsername = await findUserByUsername(nextUser);
    if (byUsername && byUsername._id.toString() !== id) {
      return NextResponse.json({ error: "Usuário já cadastrado." }, { status: 409 });
    }

    const byEmail = await findUserByEmail(nextEmail);
    if (byEmail && byEmail._id.toString() !== id) {
      return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });
    }

    const currentUserId = result.session.user.id ?? "";

    if (currentUserId === id && nextRole !== "admin") {
      return NextResponse.json(
        { error: "Você não pode remover seu próprio cargo de administrador." },
        { status: 400 },
      );
    }

    if (currentUserId === id && !nextIsActive) {
      return NextResponse.json(
        { error: "Você não pode bloquear o seu próprio acesso." },
        { status: 400 },
      );
    }

    const updated = await updateUserById(id, {
      user: nextUser,
      email: nextEmail,
      role: nextRole,
      isActive: nextIsActive,
    });

    return NextResponse.json({
      message: "Usuário atualizado com sucesso.",
      user: updated,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Falha ao atualizar usuário." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await getAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    if (result.session.user.id === id) {
      return NextResponse.json(
        { error: "Você não pode excluir seu próprio usuário." },
        { status: 400 },
      );
    }

    const deleted = await deleteUserById(id);

    if (deleted.deletedCount === 0) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ message: "Usuário excluído com sucesso." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Falha ao excluir usuário." }, { status: 500 });
  }
}
