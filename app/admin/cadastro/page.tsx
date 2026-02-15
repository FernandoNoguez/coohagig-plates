"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function AdminCadastroPage() {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Não foi possível cadastrar o usuário.");
        return;
      }

      setMessage(data.message ?? "Usuário cadastrado com sucesso.");
      setUser("");
      setEmail("");
      setPassword("");
      setRole("user");
    } catch {
      setError("Erro de conexão ao cadastrar usuário.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Cadastro de usuários (Admin)</h1>
        <p className="mt-2 text-sm text-slate-600">
          Somente administradores conseguem acessar esta rota e criar novos usuários.
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
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              e-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring"
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
              cargo
            </label>
            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value as "user" | "admin")}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          {message && <p className="text-sm font-medium text-green-600">{message}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isLoading ? "Cadastrando..." : "Cadastrar usuário"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          <Link className="font-semibold text-blue-600 hover:underline" href="/plates">
            Voltar para painel de placas
          </Link>
        </p>
      </div>
    </main>
  );
}
