"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const response = await signIn("credentials", {
      user,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (response?.error) {
      setError("Usuário ou senha inválidos.");
      return;
    }

    window.location.href = "/plates";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>
        <p className="mt-2 text-sm text-slate-600">
          Faça login com os campos <strong>user</strong> e <strong>password</strong>.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="user" className="mb-1 block text-sm font-medium text-slate-700">
              user
            </label>
            <input
              id="user"
              type="text"
              value={user}
              onChange={(event) => setUser(event.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* <p className="mt-4 text-sm text-slate-600">
          Ainda não tem conta?{" "}
          <Link className="font-semibold text-blue-600 hover:underline" href="/cadastro">
            Cadastre-se
          </Link>
        </p> */}
      </div>
    </main>
  );
}
