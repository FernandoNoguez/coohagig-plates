"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";

type SearchResponse = {
  query: string;
  exists: boolean;
  matches: string[];
  error?: string;
};

type LatestResponse = {
  latest: string[];
};

type SessionResponse = {
  user?: {
    role?: "user" | "admin";
  };
};

function normalizePlate(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export default function Home() {
  const [plateToRegister, setPlateToRegister] = useState("");
  const [plateToRemove, setPlateToRemove] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [removeMessage, setRemoveMessage] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [latestPlates, setLatestPlates] = useState<string[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);
  const [isLoadingRemove, setIsLoadingRemove] = useState(false);
  const [role, setRole] = useState<"user" | "admin">("user");

  const searchColor = useMemo(() => {
    if (!searchResult) {
      return "text-slate-600";
    }

    return searchResult.exists ? "text-green-600" : "text-red-600";
  }, [searchResult]);

  async function fetchLatest() {
    try {
      const response = await fetch("/api/plates?recent=1");
      if (!response.ok) return;
      const data: LatestResponse = await response.json();
      setLatestPlates(data.latest ?? []);
    } catch {
      // sem bloqueio da interface em caso de falha
    }
  }

  useEffect(() => {
    fetchLatest();

    async function fetchSession() {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) return;

        const session: SessionResponse = await response.json();
        if (session.user?.role === "admin") {
          setRole("admin");
        }
      } catch {
        // sem bloqueio da interface em caso de falha
      }
    }

    fetchSession();
  }, []);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterMessage("");

    const plate = normalizePlate(plateToRegister);
    if (!plate) {
      setRegisterMessage("Digite uma placa válida para cadastrar.");
      return;
    }

    setIsLoadingRegister(true);
    try {
      const response = await fetch("/api/plates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate }),
      });
      const data = await response.json();

      if (!response.ok) {
        setRegisterMessage(data.error ?? "Não foi possível cadastrar a placa.");
        return;
      }

      setRegisterMessage(data.message ?? "Placa cadastrada com sucesso.");
      setLatestPlates(data.latest ?? []);
      setPlateToRegister("");
    } catch {
      setRegisterMessage("Erro de conexão ao cadastrar placa.");
    } finally {
      setIsLoadingRegister(false);
    }
  }

  async function handleRemove(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRemoveMessage("");

    const plate = normalizePlate(plateToRemove);
    if (!plate) {
      setRemoveMessage("Digite uma placa válida para remover.");
      return;
    }

    setIsLoadingRemove(true);
    try {
      const response = await fetch("/api/plates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate }),
      });
      const data = await response.json();

      if (!response.ok) {
        setRemoveMessage(data.error ?? "Não foi possível remover a placa.");
        return;
      }

      setRemoveMessage(data.message ?? "Placa removida com sucesso.");
      setLatestPlates(data.latest ?? []);
      setPlateToRemove("");
    } catch {
      setRemoveMessage("Erro de conexão ao remover placa.");
    } finally {
      setIsLoadingRemove(false);
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = normalizePlate(searchInput);
    if (!query) {
      setSearchResult({
        query: "",
        exists: false,
        matches: [],
        error: "Digite uma placa ou parte dela para buscar.",
      });
      return;
    }

    setIsLoadingSearch(true);
    try {
      const response = await fetch(`/api/plates?query=${encodeURIComponent(query)}`);
      const data: SearchResponse = await response.json();

      if (!response.ok) {
        setSearchResult({
          query,
          exists: false,
          matches: [],
          error: data.error ?? "Erro ao buscar placas.",
        });
        return;
      }

      setSearchResult(data);
    } catch {
      setSearchResult({
        query,
        exists: false,
        matches: [],
        error: "Erro de conexão ao buscar placas.",
      });
    } finally {
      setIsLoadingSearch(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-10">
      <main className="mx-auto w-full max-w-5xl rounded-2xl bg-white p-5 shadow-lg sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Controle de Placas
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {role === "admin" && (
              <Link
                href="/admin/usuarios"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Gerenciar usuários
              </Link>
            )}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
            >
              Sair
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Cadastre, busque por trecho (IV, IVG...) e remova placas não autorizadas.
        </p>

        <section className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <h2 className="text-base font-semibold text-blue-900 sm:text-lg">
            Últimos cadastros (para conferência)
          </h2>
          {latestPlates.length === 0 ? (
            <p className="mt-2 text-sm text-blue-800">Nenhuma placa cadastrada ainda.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {latestPlates.map((plate, index) => (
                <li
                  key={`${plate}-${index}`}
                  className="rounded-md border border-blue-200 bg-white px-3 py-2 text-base font-bold tracking-wide text-blue-700"
                >
                  {index === 0 ? `Última: ${plate}` : plate}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleRegister}
            className="rounded-xl border border-slate-200 p-4 sm:p-5"
          >
            <h2 className="text-lg font-semibold text-slate-900">Cadastrar placa</h2>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Placa
              <input
                value={plateToRegister}
                onChange={(event) => setPlateToRegister(event.target.value.toUpperCase())}
                placeholder="Ex: IVG8470"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-base outline-none focus:border-blue-500"
                maxLength={10}
              />
            </label>
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              disabled={isLoadingRegister}
            >
              {isLoadingRegister ? "Cadastrando..." : "Cadastrar"}
            </button>
            {registerMessage && (
              <p className="mt-3 text-sm font-medium text-slate-700">{registerMessage}</p>
            )}
          </form>

          <form
            onSubmit={handleSearch}
            className="rounded-xl border border-slate-200 p-4 sm:p-5"
          >
            <h2 className="text-lg font-semibold text-slate-900">Buscar placa</h2>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Placa ou parte da placa
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value.toUpperCase())}
                placeholder="Ex: IVG ou IV"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-base outline-none focus:border-blue-500"
                maxLength={10}
              />
            </label>
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
              disabled={isLoadingSearch}
            >
              {isLoadingSearch ? "Buscando..." : "Buscar"}
            </button>

            {searchResult && (
              <div className="mt-4 rounded-lg bg-slate-50 p-4">
                {searchResult.error ? (
                  <p className="font-semibold text-red-600">{searchResult.error}</p>
                ) : (
                  <>
                    <p className={`text-xl font-extrabold sm:text-2xl ${searchColor}`}>
                      {searchResult.exists
                        ? `Encontramos ${searchResult.matches.length} resultado(s) para "${searchResult.query}"`
                        : `Nenhuma placa cadastrada para "${searchResult.query}"`}
                    </p>
                    {searchResult.exists && (
                      <ul className="mt-3 grid grid-cols-1 gap-2">
                        {searchResult.matches.map((plate) => (
                          <li
                            key={plate}
                            className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-lg font-bold tracking-wide text-emerald-700"
                          >
                            {plate}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            )}
          </form>

          <form
            onSubmit={handleRemove}
            className="rounded-xl border border-slate-200 p-4 sm:p-5"
          >
            <h2 className="text-lg font-semibold text-slate-900">Remover placa</h2>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Placa para remover
              <input
                value={plateToRemove}
                onChange={(event) => setPlateToRemove(event.target.value.toUpperCase())}
                placeholder="Ex: IVG8470"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-base outline-none focus:border-red-500"
                maxLength={10}
              />
            </label>
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
              disabled={isLoadingRemove}
            >
              {isLoadingRemove ? "Removendo..." : "Remover"}
            </button>
            {removeMessage && (
              <p className="mt-3 text-sm font-medium text-slate-700">{removeMessage}</p>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}