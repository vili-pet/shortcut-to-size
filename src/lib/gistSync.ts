const GIST_FILENAME = "sts-backup.json";
const GIST_DESC = "Shortcut to Size PWA backup (private)";

export async function uploadGistBackup(opts: {
  token: string;
  gistId: string;
  json: string;
}): Promise<{ ok: true; gistId: string } | { ok: false; error: string }> {
  const { token, json } = opts;
  let gistId = opts.gistId;

  const body = {
    description: GIST_DESC,
    public: false,
    files: {
      [GIST_FILENAME]: { content: json },
    },
  };

  try {
    if (!gistId) {
      const res = await fetch("https://api.github.com/gists", {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return { ok: false, error: await niceError(res) };
      }
      const data = (await res.json()) as { id: string };
      return { ok: true, gistId: data.id };
    }

    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "PATCH",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return { ok: false, error: await niceError(res) };
    }
    return { ok: true, gistId };
  } catch {
    return { ok: false, error: "Verkkovirhe — yritä uudelleen." };
  }
}

export async function downloadGistBackup(opts: {
  token: string;
  gistId: string;
}): Promise<{ ok: true; json: string } | { ok: false; error: string }> {
  try {
    const res = await fetch(`https://api.github.com/gists/${opts.gistId}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${opts.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!res.ok) {
      return { ok: false, error: await niceError(res) };
    }
    const data = (await res.json()) as {
      files: Record<string, { content?: string; truncated?: boolean; raw_url?: string }>;
    };
    const file =
      data.files[GIST_FILENAME] ?? Object.values(data.files)[0];
    if (!file) return { ok: false, error: "Gistissä ei ole backup-tiedostoa." };

    if (file.truncated && file.raw_url) {
      const raw = await fetch(file.raw_url, {
        headers: { Authorization: `Bearer ${opts.token}` },
      });
      if (!raw.ok) return { ok: false, error: "Raakadatan lataus epäonnistui." };
      return { ok: true, json: await raw.text() };
    }

    if (!file.content) return { ok: false, error: "Tyhjä backup." };
    return { ok: true, json: file.content };
  } catch {
    return { ok: false, error: "Verkkovirhe — yritä uudelleen." };
  }
}

async function niceError(res: Response): Promise<string> {
  if (res.status === 401 || res.status === 403) {
    return "Token hylätty — tarvitaan gist-oikeudet.";
  }
  if (res.status === 404) return "Gistiä ei löytynyt.";
  return `GitHub-virhe (${res.status})`;
}
