import { NextResponse } from "next/server";
import { createUser, findUserByUsername } from "@/lib/users";
import { hashPassword } from "@/lib/password";

function normalizeUsername(value: string) {
  return value.trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const user = normalizeUsername(String(body?.user ?? ""));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

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
      return NextResponse.json(
        { error: "Usuário já cadastrado." },
        { status: 409 },
      );
    }

    const { hash, salt } = hashPassword(password);

    await createUser({
      user,
      email,
      passwordHash: hash,
      passwordSalt: salt,
    });

    return NextResponse.json({
      message: "Cadastro realizado com sucesso. Faça seu login.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível concluir o cadastro." },
      { status: 500 },
    );
  }
}
