<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />
</p>

<h1 align="center">ClauseGuard India</h1>

<p align="center">
  <strong>AI-powered contract review platform built for Indian businesses.</strong><br>
  Upload NDAs, MSAs, and vendor agreements. Get evidence-backed redlines, India-aware risk analysis, and negotiation strategy in minutes.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#usage">Usage</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#license">License</a>
</p>

---

## Problem Statement

Indian businesses — from startups to enterprises — sign hundreds of vendor agreements, MSAs, and NDAs every year. The typical review process is broken:

1. **Manual review is expensive** — Legal counsel costs ₹5,000–50,000+ per contract, and most small businesses skip review entirely.
2. **Generic AI tools don't understand Indian law** — Western contract review tools miss DPDP Act 2023 compliance, Indian Contract Act nuances, and jurisdiction-specific risks.
3. **No negotiation guidance** — Even when issues are found, lawyers rarely provide structured negotiation talking points, fallback positions, or market-standard redlines.
4. **No audit trail** — When contracts are reviewed informally (email, WhatsApp, verbal), there's no record of what was flagged or why.

**The result:** Indian companies sign unfavorable contracts daily — with uncapped liability, one-sided termination, missing data protection, and foreign governing law clauses that expose them to massive risk.

## Solution

**ClauseGuard India** is an AI-powered contract review platform that solves this with an **8-agent pipeline**:

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌────────────┐
│  Ingestion   │───▶│ Segmentation │───▶│ Classification  │───▶│ Retrieval  │
│  (parse PDF) │    │ (split text) │    │ (label clauses) │    │ (find rules)│
└─────────────┘    └──────────────┘    └─────────────────┘    └────────────┘
                                                                     │
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌────▼───────┐
│  Negotiation │◀───│   Verifier   │◀───│    Redline       │◀───│ Risk Review│
│  (coach)     │    │ (verify AI)  │    │  (suggest edits) │    │ (assess)   │
└─────────────┘    └──────────────┘    └─────────────────┘    └────────────┘
```

Each agent is specialized, runs independently, and the **Verifier Agent** cross-checks every redline against retrieved evidence — ensuring no fabricated legal basis reaches the final review.

**Key differentiators for India:**
- **DPDP Act 2023 compliance** — Detects missing data protection clauses, breach notification gaps, and data localization requirements.
- **Indian Contract Act awareness** — Flags unconscionable terms, Section 28 restraint of proceedings, and consideration certainty issues.
- **Jurisdiction detection** — Catches foreign governing law in domestic contracts (e.g., Singapore law for two Indian companies).
- **Market-standard benchmarks** — Compares liability caps (12-month standard), payment terms (30-day net), and termination notice (30-day mutual) against Indian IT industry norms.

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Multi-format upload** | PDF (pdf-parse), DOCX (mammoth), plain text paste, and OCR fallback (tesseract.js) for scanned documents |
| **8-agent AI pipeline** | Specialized agents for ingestion, segmentation, classification, retrieval, risk review, redline generation, verification, and negotiation coaching |
| **Real-time streaming** | Server-Sent Events (SSE) show agent progress in real-time during review |
| **Evidence-backed redlines** | Every suggested edit is backed by retrieved playbook rules with relevance scores |
| **Independent verifier** | Verifier Agent rejects redlines lacking sufficient evidence and triggers re-retrieval |
| **Negotiation coaching** | Each clause gets a stance (PUSH HARD / NEGOTIABLE / STANDARD) with talking points and fallback positions |
| **Missing clause detection** | Compares contract against 16 Indian playbook rules to find absent critical clauses |
| **Export report** | Multi-page professional HTML report with cover page, executive summary, risk breakdown, clause-by-clause review, and audit log |

### Demo Features

| Feature | Description |
|---------|-------------|
| **Pre-seeded demo contract** | Indian MSA (Acme Technologies vs Vendor Solutions) with 6 clauses covering all risk levels — instant "wow" moment with zero wait time |
| **Interactive walkthrough** | Dashboard shows 4-step guide: click high risk → view evidence → see negotiation stance → export report |
| **Playbook rules** | 16 pre-seeded Indian legal playbook rules covering confidentiality, data protection, IP ownership, liability, termination, governing law, and more |

### UI/UX

- **3-panel review interface** — Clause list (left), clause detail with redlines (center), evidence citations and verifier timeline (right)
- **Dark mode** — Full theme support with next-themes
- **Responsive design** — Works on desktop and tablet
- **Real-time progress** — Live agent execution updates via SSE

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Frontend** | React 19, Tailwind CSS 4, shadcn/ui, Framer Motion |
| **State** | Zustand, TanStack React Query |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Authentication** | NextAuth v5 (credentials + OAuth) |
| **AI Model** | NVIDIA NIM API (Meta Llama 3.1 8B Instruct) |
| **Text Extraction** | pdf-parse (PDF), mammoth (DOCX), tesseract.js (OCR) |
| **Deployment** | Vercel |

## Getting Started

### Prerequisites

- **Node.js** 20+ and npm
- **MongoDB Atlas** cluster (free tier works)
- **NVIDIA NIM API key** — Get one free at [build.nvidia.com](https://build.nvidia.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd clauseguard-india
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual credentials:

   | Variable | Description |
   |----------|-------------|
   | `MONGODB_URI` | MongoDB Atlas connection string |
   | `MONGODB_DB_NAME` | Database name (default: `clauseguard`) |
   | `NVIDIA_API_KEY` | NVIDIA NIM API key |
   | `NVIDIA_BASE_URL` | `https://integrate.api.nvidia.com/v1` |
   | `NVIDIA_MODEL` | `meta/llama-3.1-8b-instruct` |
   | `AUTH_SECRET` | Run `openssl rand -hex 32` to generate |
   | `AUTH_URL` | `http://localhost:3000` |
   | `NEXTAUTH_URL` | `http://localhost:3000` |
   | `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Register an account** — Click "Create one" on the sign-in page, then log in.

6. **Load the demo** — The dashboard auto-seeds a pre-reviewed demo contract on first load. Click "View Review" to explore instantly.

### Build for Production

```bash
npm run build
npm start
```

## Usage

### Review a Contract

1. **Navigate to Contracts** → Click "New Contract"
2. **Paste contract text** — Enter a title and paste the full agreement text
3. **Click "Save Text"** — Contract is created
4. **Click "Run Full Review"** — The 8-agent pipeline runs with real-time progress
5. **Explore results** — Click clauses in the left panel to see:
   - Risk level and issue summary (center panel)
   - Suggested redlines with rationale
   - Evidence citations from Indian legal playbooks (right panel)
   - Verifier approval timeline

### Negotiation Coaching

For each flagged clause, the Negotiation Coach provides:
- **Stance** — PUSH HARD (non-negotiable), NEGOTIABLE, or STANDARD
- **Talking point** — Ready-to-use language for vendor calls
- **Legal impact** — What happens if not addressed under Indian law
- **Business impact** — Commercial consequences
- **Fallback position** — Acceptable compromise if vendor pushes back

### Export Report

Click "Export Report" to download a professional multi-page HTML report:
- **Page 1** — Cover with parties, jurisdiction, report ID
- **Page 2** — Executive summary with risk grid, breakdown table, key observations
- **Page 3** — Missing clauses with red flags and recommended text
- **Pages 4+** — Clause-by-clause review (High → Medium) with original text, issues, redlines, evidence, negotiation guidance
- **Last page** — Audit log with agent execution times and pipeline statistics

Open the HTML file in any browser and print to PDF for a polished output.

## Project Structure

```
clauseguard-india/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── agent/              # AI agent orchestration endpoint
│   │   │   ├── auth/               # NextAuth + registration
│   │   │   │   ├── [...nextauth]/  # NextAuth catch-all
│   │   │   │   └── register/       # User registration
│   │   │   ├── contracts/          # Contract CRUD
│   │   │   │   └── [id]/           # Single contract + OCR
│   │   │   ├── reviews/            # Review management
│   │   │   │   └── stream/         # SSE streaming endpoint
│   │   │   ├── seed/               # Demo data seeding
│   │   │   ├── upload/             # File upload handler
│   │   │   └── user/               # User profile
│   │   ├── app/                    # Authenticated app pages
│   │   │   ├── contracts/          # Contract list + detail views
│   │   │   │   └── [id]/           # 3-panel review interface
│   │   │   ├── playbooks/          # Playbook rule management
│   │   │   ├── settings/           # User settings
│   │   │   ├── page.tsx            # Dashboard with demo hero card
│   │   │   ├── layout.tsx          # App shell layout
│   │   │   └── error.tsx           # Error boundary
│   │   ├── about/                  # About page
│   │   ├── demo/                   # Sign-in / demo entry
│   │   ├── pricing/                # Pricing page
│   │   ├── register/               # Registration page
│   │   ├── security/               # Security page
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Landing page
│   ├── components/
│   │   ├── clause/                 # Clause detail components
│   │   ├── coach/                  # Negotiation coach UI
│   │   ├── contract/               # Contract list cards
│   │   ├── dashboard/              # Dashboard widgets
│   │   ├── evidence/               # Evidence citation display
│   │   ├── landing/                # Landing page sections
│   │   ├── layout/                 # Header, Footer, AppShell
│   │   ├── theme/                  # Theme provider
│   │   ├── ui/                     # shadcn/ui primitives
│   │   ├── report-template.tsx     # Report template component
│   │   └── review-progress.tsx     # SSE progress indicator
│   └── lib/
│       ├── agents/                 # 8 AI agent implementations
│       ├── ai/                     # AI model client (NVIDIA NIM)
│       ├── auth/                   # NextAuth configuration
│       ├── contracts/              # Contract business logic
│       ├── db/                     # MongoDB models + connection
│       │   ├── models.ts           # All Mongoose schemas
│       │   ├── mongodb.ts          # DB connection
│       │   ├── prisma.ts           # Model re-exports
│       │   ├── seed-demo-contract.ts  # Demo contract seed data
│       │   └── seed-playbooks.ts   # 16 playbook rules seed
│       ├── demo/                   # Demo utilities
│       ├── playbooks/              # Playbook rule logic
│       ├── redlining/              # Redline generation
│       ├── retrieval/              # Evidence retrieval
│       ├── uploads/                # Text extraction (PDF/DOCX/OCR)
│       ├── orchestrator.ts         # Agent pipeline orchestrator
│       ├── prompts.ts              # AI prompts for all agents
│       ├── types.ts                # Shared TypeScript types
│       └── utils.ts                # Utility functions
├── public/                         # Static assets
├── .env.example                    # Environment variable template
├── LICENSE                         # MIT License
├── README.md                       # This file
├── next.config.ts                  # Next.js configuration
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Environment Variables for Production (Vercel)

When deploying to Vercel, set these in **Project Settings → Environment Variables**:

| Variable | Production Value |
|----------|-----------------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | `clauseguard` |
| `NVIDIA_API_KEY` | Your NVIDIA NIM API key |
| `NVIDIA_BASE_URL` | `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_MODEL` | `meta/llama-3.1-8b-instruct` |
| `AUTH_SECRET` | Generate with `openssl rand -hex 32` |
| `AUTH_URL` | `https://your-domain.vercel.app` |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |

## Known Limitations

- **OCR accuracy** — Tesseract.js OCR quality depends on image resolution. For best results, use PDF or plain text.
- **AI model latency** — The 8-agent pipeline calls the AI model multiple times. First review may take 15–30 seconds depending on API latency.
- **Playbook coverage** — Currently 16 clause types covered. Complex contracts with niche clauses (e.g., force majeure, non-compete in employment) may need additional playbook rules.
- **No file storage** — Uploaded files are not persisted to cloud storage. Only extracted text is stored in MongoDB.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run the linter: `npm run lint`
5. Commit: `git commit -m "Add amazing feature"`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for Indian businesses • AI-assisted review — not a substitute for legal advice.
</p>
