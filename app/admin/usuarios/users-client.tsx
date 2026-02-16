"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Role = "user" | "admin";

type User = {
  id: string;
  user: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
};

export default function AdminUsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [newUser, setNewUser] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("user");
  const [newMessage, setNewMessage] = useState("");
  const [newError, setNewError] = useState("");
  const [isSavingNew, setIsSavingNew] = useState(false);

  const [savingId, setSavingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  async function loadUsers() {
    setIsLoading(true);
    setListError("");

    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (!response.ok) {
        setListError(data.error ?? "Não foi possível listar usuários.");
        return;
      }

      setUsers(data.users ?? []);
    } catch {
      setListError("Erro de conexão ao listar usuários.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewMessage("");
    setNewError("");
    setIsSavingNew(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: newUser,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setNewError(data.error ?? "Não foi possível cadastrar usuário.");
        return;
      }

      setNewMessage(data.message ?? "Usuário cadastrado com sucesso.");
      setNewUser("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
      await loadUsers();
    } catch {
      setNewError("Erro de conexão ao cadastrar usuário.");
    } finally {
      setIsSavingNew(false);
    }
  }

  async function handleSaveUser(user: User) {
    setSavingId(user.id);
    setListError("");

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user.user,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setListError(data.error ?? "Não foi possível atualizar usuário.");
        return;
      }

      await loadUsers();
    } catch {
      setListError("Erro de conexão ao atualizar usuário.");
    } finally {
      setSavingId("");
    }
  }

  async function handleDeleteUser(id: string) {
    setDeletingId(id);
    setListError("");

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        setListError(data.error ?? "Não foi possível excluir usuário.");
        return;
      }

      await loadUsers();
    } catch {
      setListError("Erro de conexão ao excluir usuário.");
    } finally {
      setDeletingId("");
    }
  }

  function updateUserField(id: string, field: keyof User, value: string | boolean) {
    setUsers((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <section className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Administração de usuários</h1>
            <Link href="/plates" className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900">
              Voltar ao painel
            </Link>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Aqui o administrador pode cadastrar, editar, excluir usuários e restringir acesso ao app.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900">Novo usuário</h2>
          <form onSubmit={handleCreateUser} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              value={newUser}
              onChange={(event) => setNewUser(event.target.value)}
              placeholder="user"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
            />
            <input
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              type="email"
              placeholder="e-mail"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
            />
            <input
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              type="password"
              minLength={6}
              placeholder="password"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
            />
            <select
              value={newRole}
              onChange={(event) => setNewRole(event.target.value as Role)}
              className="rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
            <button
              type="submit"
              disabled={isSavingNew}
              className="sm:col-span-2 rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSavingNew ? "Cadastrando..." : "Cadastrar usuário"}
            </button>
          </form>
          {newError && <p className="mt-3 text-sm font-medium text-red-600">{newError}</p>}
          {newMessage && <p className="mt-3 text-sm font-medium text-green-600">{newMessage}</p>}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900">Usuários cadastrados</h2>
          {isLoading ? (
            <p className="mt-3 text-sm text-slate-600">Carregando usuários...</p>
          ) : users.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Nenhum usuário cadastrado.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {users.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={item.user}
                      onChange={(event) => updateUserField(item.id, "user", event.target.value)}
                      className="rounded-md border border-slate-300 px-3 py-2"
                    />
                    <input
                      value={item.email}
                      onChange={(event) => updateUserField(item.id, "email", event.target.value)}
                      className="rounded-md border border-slate-300 px-3 py-2"
                    />
                    <select
                      value={item.role}
                      onChange={(event) => updateUserField(item.id, "role", event.target.value as Role)}
                      className="rounded-md border border-slate-300 px-3 py-2"
                    >
                      <option value="user">Usuário</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <label className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={(event) => updateUserField(item.id, "isActive", event.target.checked)}
                      />
                      Acesso liberado
                    </label>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveUser(item)}
                      disabled={savingId === item.id}
                      className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300"
                    >
                      {savingId === item.id ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(item.id)}
                      disabled={deletingId === item.id}
                      className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-red-300"
                    >
                      {deletingId === item.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {listError && <p className="mt-3 text-sm font-medium text-red-600">{listError}</p>}
        </section>
      </div>
    </main>
  );
}
