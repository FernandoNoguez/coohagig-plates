import { NextResponse } from "next/server";
import {
  createUser,
  ensureUserIndexes,
  findUserByEmail,
  findUserByUsername,
  listUsers,
  type UserRole,
} from "@/lib/users";
import { hashPassword } from "@/lib/password";
import { getAdminSession } from "@/lib/admin-auth";

function normalizeUsername(value: string) {
  return value.trim();
}

function parseRole(value: string): UserRole {
  return value === "admin" ? "admin" : "user";
}

export async function GET() {
  const result = await getAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    await ensureUserIndexes();
    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Falha ao listar usuários." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const result = await getAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const body = await request.json();

    const user = normalizeUsername(String(body?.user ?? ""));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const role = parseRole(String(body?.role ?? "user"));

    if (!user || !email || !password) {
      return NextResponse.json(
        { error: "Informe usuário, e-mail e senha para cadastro." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha precisa ter pelo menos 6 caracteres." },
        { status: 400 },
      );
    }

    const existingUser = await findUserByUsername(user);
    if (existingUser) {
      return NextResponse.json({ error: "Usuário já cadastrado." }, { status: 409 });
    }

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });
    }

    const { hash, salt } = hashPassword(password);

    await createUser({
      user,
      email,
      role,
      passwordHash: hash,
      passwordSalt: salt,
    });

    return NextResponse.json({
      message: `Usuário ${user} cadastrado com sucesso como ${role}.`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Falha ao cadastrar usuário." }, { status: 500 });
  }
}
