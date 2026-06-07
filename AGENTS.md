<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Guide digests → docs/guides/

Before using any library, check `docs/guides/<lib>.md`:

- **Missing or version in header ≠ installed version** → read the current guide (`node_modules/<lib>/dist/docs/` or official docs), then write/refresh the digest.
- **Up to date** → reuse it.
  Each digest: pin the version(s) in the header; keep only what matters for _our_ stack (Next 16, React 19, Tailwind v4, FSD). Short and project-specific — not a copy of the docs.

# Commits are the user's job

Never run `git commit` or `git push` — the user makes every commit themselves, even if asked or it seems convenient. Proposing a commit message (and staging changes) is fine and encouraged; just never run the commit yourself.
