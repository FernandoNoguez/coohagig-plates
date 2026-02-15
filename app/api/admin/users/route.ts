import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
  type UserRole,
} from "@/lib/users";
import { hashPassword } from "@/lib/password";

function normalizeUsername(value: string) {
  return value.trim();
}

function parseRole(value: string): UserRole {
  return value === "admin" ? "admin" : "user";
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
    }

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
