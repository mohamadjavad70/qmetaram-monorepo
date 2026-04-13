import { NextResponse } from "next/server";
import { execSync } from "node:child_process";

type RepoInfo = {
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  default_branch: string;
};

type CodespaceInfo = {
  name: string;
  display_name: string;
  state: string;
  repository: { full_name: string };
  branch: string;
  created_at: string;
};

function ghJson(cmd: string): any {
  // IMPORTANT: relies on gh CLI being authenticated on the server environment
  const out = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  return JSON.parse(out);
}

export async function GET() {
  try {
    // Repos
    const repos: RepoInfo[] = ghJson(
      `gh api -H "Accept: application/vnd.github+json" /user/repos?per_page=100 --paginate`
    );

    // Codespaces (may fail if scope missing)
    let codespaces: CodespaceInfo[] = [];
    try {
      const cs = ghJson(`gh api -H "Accept: application/vnd.github+json" /user/codespaces?per_page=100`);
      codespaces = cs.codespaces ?? [];
    } catch {
      codespaces = [];
    }

    return NextResponse.json({
      ok: true,
      account: ghJson(`gh api user`).login,
      repos: repos.map(r => ({
        name: r.name,
        full_name: r.full_name,
        private: r.private,
        html_url: r.html_url,
        stars: r.stargazers_count,
        forks: r.forks_count,
        issues: r.open_issues_count,
        updated_at: r.updated_at,
        default_branch: r.default_branch,
      })),
      codespaces: codespaces.map(c => ({
        name: c.name,
        display_name: c.display_name,
        state: c.state,
        repo: c.repository?.full_name ?? "",
        branch: c.branch,
        created_at: c.created_at,
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "unknown error" },
      { status: 500 }
    );
  }
}
