# 📝 Briefly — AI Product Requirements Document (PRD) Workspace

<p align="center">
  <strong>Transform rough product concepts into comprehensive, decision-ready PRDs in seconds using DeepSeek & Next.js.</strong>
</p>

<p align="center">
  <a href="https://portfolio.madanmohanlearning.workers.dev/"><img src="https://img.shields.io/badge/Live%20Demo-Available-brightgreen?style=flat-square" alt="Live Demo"></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square" alt="Next.js"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square" alt="React"></a>
  <a href="https://deepseek.com"><img src="https://img.shields.io/badge/AI%20Engine-DeepSeek%20V3-blueviolet?style=flat-square" alt="DeepSeek"></a>
  <a href="https://workers.cloudflare.com"><img src="https://img.shields.io/badge/Deployment-Cloudflare%20Workers-f38020?style=flat-square" alt="Cloudflare Workers"></a>
</p>

---

## 📌 Overview

**Briefly** is an AI-powered product management workspace designed to eliminate the blank-page problem for Product Managers, Technical Program Managers, and Engineering Leads. By combining structured contextual intake with DeepSeek's advanced reasoning models, Briefly transforms loose product ideas into structured, actionable Product Requirements Documents (PRDs) complete with user personas, user stories, acceptance criteria, technical considerations, and success metrics.

---

## ✨ Key Features

- **🧠 Guided Contextual Intake:** Multi-step questionnaire capturing core problem statements, target personas, technical constraints, and business goals.
- **⚡ DeepSeek AI Synthesis:** Generates complete, structured PRD sections:
  - **Executive Summary & Problem Statement**
  - **Target User Personas & Pain Points**
  - **Functional Requirements & User Stories** (with testable acceptance criteria)
  - **Non-Functional Requirements** (Performance, Security, Compliance)
  - **Technical Architecture & Data Model Considerations**
  - **KPIs, Success Metrics & GTM Rollout Checklist**
- **✏️ Real-Time Document Completeness Scoring:** Live quality score evaluates the thoroughness of the PRD draft as you refine it.
- **💾 Local-First Drafts & Multi-Format Export:** Automatic local-storage draft saving with instant export to **Markdown (.md)**, **HTML**, and **Clipboard**.
- **🛡️ Privacy & Rate Limiting:** Server-side DeepSeek key protection with privacy-preserving SHA-256 hashed rate limiting via **Upstash Redis**.
- **🌐 Serverless & Edge Deployed:** Deployed as a full-stack Next.js application on **Cloudflare Workers** with zero cold starts.

---

## 🏗️ Architecture

```mermaid
flowchart LR
    A[User Product Idea] --> B[Briefly Guided Intake]
    B --> C[Edge API Proxy / DeepSeek Reasoning]
    C --> D[Structured PRD Generator]
    D --> E[Completeness Scoring & Live Editor]
    E --> F[Export Markdown / Notion / Confluence]
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js:** v20+ or v22+
- **pnpm:** `npm install -g pnpm`
- **DeepSeek API Key**
- **Upstash Redis REST URL & Token** (for rate limiting)

### Installation

```bash
# Clone the repository
git clone https://github.com/MadanMohan0537/briefly-prd-ai.git
cd briefly-prd-ai

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env.local
# Fill in DEEPSEEK_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN in .env.local

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router), React
- **Language:** TypeScript
- **AI Model:** DeepSeek-V3 / DeepSeek-R1 API
- **State & Storage:** Local-first browser storage + Upstash Redis
- **Styling:** Vanilla CSS & PostCSS
- **Deployment:** Cloudflare Workers (Vinext / OpenNext)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
