# Briefly

Briefly is a focused AI workspace that turns a rough product idea into an editable Product Requirements Document. It uses the DeepSeek Chat API and is designed to run on a free hosting tier.

## What it does

- Guides the user through a concise product brief
- Generates a structured, decision-ready PRD with a server-side DeepSeek key
- Gives each visitor three free lifetime PRD generations
- Scores document completeness as the draft evolves
- Saves drafts locally and automatically
- Exports finished documents as Markdown
- Works responsively on desktop, tablet, and mobile

## Privacy and free-usage model

The DeepSeek API key is stored only as a server-side deployment secret. It is
never sent to the browser or committed to the repository.

Usage is tracked in Upstash Redis using a salted SHA-256 hash of the visitor's
network address; raw addresses are not stored. Each visitor receives three
successful generations. Shared networks may share one allowance, so add
authentication later if account-level enforcement is required.

## Local development

Requirements:

- Node.js 22.13 or newer
- pnpm
- A DeepSeek API key for live generation
- An Upstash Redis database

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and fill in the four server-side values.
Then open the local URL shown in the terminal.

## Validation

```bash
pnpm build
pnpm lint
```

## Deployment

The project is configured for Cloudflare-compatible deployment through OpenAI Sites. No paid database, authentication provider, or storage service is required. Drafts use browser local storage.

### Vercel

The repository also includes a `vercel.json` override that uses the native
Next.js build on Vercel. Import the GitHub repository and keep the detected
framework set to **Next.js**. No custom output directory is required. Install
Upstash Redis from the Vercel Marketplace, then add `DEEPSEEK_API_KEY` and
`RATE_LIMIT_SALT` as sensitive environment variables before redeploying.

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

- **Server-side key:** visitors can use the product without seeing or supplying the owner's DeepSeek credential.
- **Three-generation allowance:** persistent Redis counters enforce a small lifetime free tier per network address.
- **Local-first drafts:** no database is required, and drafts remain on the user's device.
- **Markdown output:** portable across GitHub, Notion, Confluence, and common editors.
- **Opinionated PRD structure:** the model is prompted for outcomes, non-goals, testable requirements, risks, and open questions.

## License

MIT
