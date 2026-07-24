# Briefly

Briefly is a focused AI workspace that turns a rough product idea into an editable Product Requirements Document. It uses the DeepSeek Chat API and is designed to run on a free hosting tier.

## What it does

- Guides the user through a concise product brief
- Generates a structured, decision-ready PRD with DeepSeek
- Scores document completeness as the draft evolves
- Saves drafts locally and automatically
- Exports finished documents as Markdown
- Works responsively on desktop, tablet, and mobile

## Privacy model

The DeepSeek API key is entered by the user and kept in browser session storage. It is sent only to the server-side generation endpoint and then to DeepSeek for the requested generation. It is not committed to the repository, written into the draft, or persisted by Briefly.

For a production multi-user service, add authentication, rate limiting, abuse prevention, and a managed secret before offering a shared platform key.

## Local development

Requirements:

- Node.js 22.13 or newer
- pnpm
- A DeepSeek API key for live generation

```bash
pnpm install
pnpm dev
```

Open the local URL shown in the terminal. Use the **DeepSeek** button in the header to connect your key.

## Validation

```bash
pnpm build
pnpm lint
```

## Deployment

The project is configured for Cloudflare-compatible deployment through OpenAI Sites. No paid database, authentication provider, or storage service is required. Drafts use browser local storage.

## Project structure

```text
app/
  api/generate/route.ts   DeepSeek proxy and PRD prompt
  globals.css             Product styling and responsive layout
  layout.tsx              Metadata and social preview
  page.tsx                Guided brief, editor, local drafts, and export
public/
  og.png                  Social sharing card
```

## Product decisions

- **Bring your own key:** keeps infrastructure cost near zero and avoids exposing a shared secret.
- **Local-first drafts:** no database is required, and drafts remain on the user's device.
- **Markdown output:** portable across GitHub, Notion, Confluence, and common editors.
- **Opinionated PRD structure:** the model is prompted for outcomes, non-goals, testable requirements, risks, and open questions.

## License

MIT
