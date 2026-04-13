"use client";

import React, { useEffect, useMemo, useState } from "react";

type Repo = {
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  stars: number;
  forks: number;
  issues: number;
  updated_at: string;
  default_branch: string;
};

type Codespace = {
  name: string;
  display_name: string;
  state: string;
  repo: string;
  branch: string;
  created_at: string;
};

type Payload = {
  ok: boolean;
  account?: string;
  repos?: Repo[];
  codespaces?: Codespace[];
  error?: string;
};

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleString("fa-IR");
  } catch {
    return s;
  }
}

export default function JupiterMonitor() {
  const [data, setData] = useState<Payload>({ ok: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      const res = await fetch("/api/github", { cache: "no-store" });
      const json = (await res.json()) as Payload;
      if (alive) {
        setData(json);
        setLoading(false);
      }
    }
    load();
    const t = setInterval(load, 15_000); // refresh
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const repos = data.repos ?? [];
  const codespaces = data.codespaces ?? [];

  const summary = useMemo(() => {
    const total = repos.length;
    const priv = repos.filter(r => r.private).length;
    const pub = total - priv;
    const stars = repos.reduce((a, r) => a + (r.stars || 0), 0);
    const recent = [...repos].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)).slice(0, 6);
    return { total, priv, pub, stars, recent };
  }, [repos]);

  return (
    <main className="min-h-screen bg-neutral-950 text-amber-200 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col gap-2">
          <div className="text-xs opacity-70">SOVEREIGN DASHBOARD / JUPITER MONITOR</div>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-wide">
              GitHub Ops Monitor
            </h1>
            <div className="text-xs px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10">
              {loading ? "SYNCING…" : `ACCOUNT: ${data.account ?? "unknown"}`}
            </div>
          </div>
        </header>

        {!data.ok && !loading && (
          <div className="p-4 rounded-xl border border-red-400/30 bg-red-400/10 text-red-200 text-sm">
            API error: {data.error ?? "unknown"}
          </div>
        )}

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Repos" value={summary.total} />
          <Stat label="Public" value={summary.pub} />
          <Stat label="Private" value={summary.priv} />
          <Stat label="Total Stars" value={summary.stars} />
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <Card title="Recent activity">
            <ul className="space-y-2 text-sm">
              {summary.recent.map(r => (
                <li key={r.full_name} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
                  <a className="underline decoration-amber-400/40 hover:decoration-amber-300"
                     href={r.html_url}
                     target="_blank"
                     rel="noreferrer">
                    {r.full_name}
                  </a>
                  <span className="text-xs opacity-70">{fmtDate(r.updated_at)}</span>
                </li>
              ))}
              {summary.recent.length === 0 && <li className="opacity-70">No repos found.</li>}
            </ul>
          </Card>

          <Card title="Codespaces">
            <ul className="space-y-2 text-sm">
              {codespaces.map(c => (
                <li key={c.name} className="border border-white/5 rounded-lg p-3 bg-white/5">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{c.display_name || c.name}</div>
                    <Badge state={c.state} />
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {c.repo} · {c.branch} · {fmtDate(c.created_at)}
                  </div>
                </li>
              ))}
              {codespaces.length === 0 && (
                <li className="opacity-70">
                  No codespaces returned (either none exist, or scope/policy blocks listing).
                </li>
              )}
            </ul>
          </Card>
        </section>

        <footer className="text-xs opacity-60 pt-4">
          Refreshes every 15s. This page reads GitHub data via server-side `gh api`.
        </footer>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 rounded-xl border border-amber-400/20 bg-amber-400/5">
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl border border-amber-400/20 bg-amber-400/5">
      <div className="text-sm font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

function Badge({ state }: { state: string }) {
  const cls =
    state === "Available" || state === "Running"
      ? "border-green-400/30 bg-green-400/10 text-green-200"
      : "border-amber-400/30 bg-amber-400/10 text-amber-200";
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${cls}`}>
      {state}
    </span>
  );
}
