"use client";

import { FormEvent, useMemo, useState } from "react";

type SearchResponse = {
  query: string;
  exists: boolean;
  matches: string[];
  error?: string;
};

function normalizePlate(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export default function Home() {
  const [plateToRegister, setPlateToRegister] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);

  const searchColor = useMemo(() => {
    if (!searchResult) {
      return "text-slate-600";
    }

    return searchResult.exists ? "text-green-600" : "text-red-600";
  }, [searchResult]);

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
      setPlateToRegister("");
    } catch {
      setRegisterMessage("Erro de conexão ao cadastrar placa.");
    } finally {
      setIsLoadingRegister(false);
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
      <main className="mx-auto w-full max-w-4xl rounded-2xl bg-white p-5 shadow-lg sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Controle de Placas
        </h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Cadastre placas e busque por placa completa ou parcialmente (ex: IVG, IV).
        </p>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
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
                      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
        </section>
      </main>
    </div>
  );
}
