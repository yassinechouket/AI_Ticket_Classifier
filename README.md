# AI Ticket Classifier

## Problem Statement

Support teams receive large volumes of unstructured, free-form tickets every day. Each ticket requires a human operator to read it, understand the context, determine its urgency and category, assign it to the correct team, and look up relevant knowledge or past cases before a resolution can begin.

This process is manual, slow (5–15 minutes per ticket), inconsistent across shifts and operators, and does not scale. Critical tickets can be delayed or miscategorised, causing business impact. Institutional knowledge is locked inside individuals rather than made systematically available.

---

## Solution

AI Ticket Classifier is a full-stack application built around an **adaptive LangGraph ReAct agent** powered by Azure OpenAI. It takes a free-form support ticket as input and returns a fully structured analysis in under three seconds, covering:

- **Automatic classification** — category, priority (P1–P4), and owning team
- **Metadata extraction** — urgency, affected systems, user impact, keywords, priority score, and escalation flag
- **Semantic knowledge search** — relevant articles retrieved from a Qdrant vector store using Ada-002 embeddings
- **Historical ticket matching** — similar resolved tickets surfaced from PostgreSQL to aid resolution
- **Actionable recommendations** — immediate actions, resolution steps, and estimated time to resolution

The agent operates in a Think → Act → Observe loop, invoking specialised tools at each step and synthesising their results into a single structured response. Thread IDs and PostgreSQL-backed checkpoints enable full conversation continuity across sessions.

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime & framework | Node.js 22, NestJS 11, TypeScript 5 |
| Agent framework | LangGraph 0.4 (ReAct graph) |
| LLM provider | Azure OpenAI — GPT-4o (reasoning), Ada-002 (embeddings) |
| Checkpoint persistence | `@langchain/langgraph-checkpoint-postgres` — PostgreSQL |
| Vector store | Qdrant v1.12 with REST client |
| Messaging / streaming | Redis 8 (pub/sub) via `redis` client |
| Validation | class-validator, class-transformer, Zod |
| Documentation | Swagger / OpenAPI via `@nestjs/swagger` |

### Frontend

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI library | React 19 |
| Styling | Tailwind CSS v4 (CSS-variable design tokens, class-based dark mode) |
| Language | TypeScript 5 |

### Infrastructure

| Service | Image | Port |
|---|---|---|
| PostgreSQL | postgres:17-alpine | 5433 |
| Redis | redis:8-alpine | 6379 |
| Qdrant | qdrant/qdrant:v1.12.1 | 6333, 6334 |

---

## Project Structure

```
AI-Ticket-Classifier/
├── backend/                          # NestJS application
│   ├── src/
│   │   ├── agent/                    # LangGraph ReAct agent
│   │   │   ├── implementations/
│   │   │   │   └── react.agent.ts    # Agent graph, tool binding, checkpointer init
│   │   │   ├── memory/
│   │   │   │   └── memory.ts         # PostgresSaver checkpoint configuration
│   │   │   ├── agent.builder.ts      # Graph construction
│   │   │   ├── agent.factory.ts      # DI factory for agent instances
│   │   │   ├── agent.module.ts
│   │   │   └── prompts.ts            # System prompt
│   │   ├── api/                      # HTTP layer
│   │   │   ├── agent/
│   │   │   │   ├── controller/       # AgentController (POST /analyze, GET /history)
│   │   │   │   ├── dto/              # Request/response DTOs
│   │   │   │   └── service/          # AgentService (orchestrates agent invocation)
│   │   │   └── utils/
│   │   ├── config/                   # Azure OpenAI + Qdrant config factories
│   │   ├── messaging/                # Redis pub/sub service (SSE streaming)
│   │   ├── tools/                    # Four LangChain tools
│   │   │   ├── classification/       # GPT-4o structured classification
│   │   │   ├── extraction/           # GPT-4o metadata extraction
│   │   │   ├── historical/           # PostgreSQL historical ticket lookup
│   │   │   └── knowledge/            # Qdrant semantic search tool
│   │   ├── vector-search/
│   │   │   ├── knowledge-loader.service.ts   # Seeds knowledge_base/ into Qdrant on boot
│   │   │   └── vector-search.service.ts      # Qdrant client wrapper
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── knowledge_base/               # Plain-text knowledge articles (12 files, 63 chunks)
│   ├── docker-compose.yml
│   ├── .env.example
│   ├── jest.config.js
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/                         # Next.js application
    ├── app/
    │   ├── layout.tsx                # Root layout: ThemeProvider + Navbar
    │   ├── globals.css               # Tailwind v4 design tokens, dark mode variant
    │   ├── page.tsx                  # Dashboard / home
    │   ├── analyze/
    │   │   └── page.tsx              # Ticket analysis page
    │   └── history/
    │       └── page.tsx              # Saved analysis history page
    ├── components/
    │   ├── ThemeProvider.tsx         # React context, localStorage-backed dark mode
    │   ├── Navbar.tsx                # Sticky navigation with theme toggle
    │   ├── QueryInput.tsx            # Ticket input form with example prompts
    │   ├── AgentResponseCard.tsx     # Full structured response display
    │   ├── ClassificationBadge.tsx   # Priority / category / team badge
    │   └── Loader.tsx                # Animated loading indicator
    ├── lib/
    │   ├── api.ts                    # fetch wrappers for backend endpoints
    │   ├── history.ts                # localStorage read/write helpers
    │   └── utils.ts                  # ID generation, style maps, clipboard
    ├── types/
    │   └── index.ts                  # Shared TypeScript types
    ├── .env.local
    └── package.json
```

---

## Setup Instructions

### Prerequisites

- Docker Desktop (running)
- Node.js 22 or later
- npm 10 or later

### 1. Clone the repository

```bash
git clone https://github.com/chouket0102/AI-Ticket-Classifier.git
cd AI-Ticket-Classifier
```

### 2. Configure backend environment variables

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in your Azure OpenAI credentials:

```env
AZURE_OPENAI_API_KEY=<your-key>
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME=<your-embedding-deployment>
AZURE_OPENAI_API_VERSION=2024-08-01-preview

# The values below match the docker-compose defaults and do not need changing
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=agent_db

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=admin

QDRANT_HOST=localhost
QDRANT_PORT=6333

PORT=3001
```


### 3. Start infrastructure services

From the `backend/` directory:

```bash
docker compose up -d
```

This starts PostgreSQL (port 5433), Redis (port 6379), and Qdrant (port 6333). Wait for all three containers to report healthy before proceeding.

```bash
docker compose ps
```

### 4. Install backend dependencies and start the API

```bash
# still inside backend/
npm install
npm run start:dev
```

On first boot the application will:

1. Create the LangGraph checkpoint tables in PostgreSQL automatically via `OnModuleInit`.
2. Load the 12 knowledge-base articles from `knowledge_base/` into Qdrant (63 chunks). Subsequent starts skip this step if the collection already contains points.
3. Start the NestJS server on `http://localhost:3001`.

### 5. Install frontend dependencies and start the dev server

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Next.js application starts on `http://localhost:3000`.

---

## API Reference

### POST /api/agent/analyze

Submit a ticket for analysis.

**Request body:**

```json
{
  "message": "Our production payment gateway has been down for 2 hours.",
  "threadId": "thread-abc123"
}
```

**Response:** `TicketAnalysisResponse` — contains classification, metadata, recommendations, knowledge articles, historical tickets, and tools used.

### GET /api/agent/history/:threadId

Retrieve the message history for a given thread.

Swagger UI is available at `http://localhost:3001/api/docs` while the server is running.

---

## Running Tests

The test suite covers all service classes and the API controller. Tests are unit-level and use Jest with NestJS testing utilities. All external dependencies (Redis, Qdrant, OpenAI, filesystem) are fully mocked.

> Tests were written as part of the development process to validate each service in isolation after the core implementation was complete.

From the `backend/` directory:

```bash
# Run all tests once
npm test

# Run in watch mode
npm run test:watch

# Run with coverage report
npm run test:cov
```

The Jest configuration enforces `maxWorkers: 1` and a 512 MB worker memory limit to prevent out-of-memory crashes caused by LangChain's deep TypeScript types during compilation.

### Test files

| File | Coverage |
|---|---|
| `src/tools/classification/classification.service.spec.ts` | ClassificationService |
| `src/tools/extraction/extraction.service.spec.ts` | ExtractionService |
| `src/tools/historical/historical.service.spec.ts` | HistoricalService |
| `src/messaging/redis/redis.service.spec.ts` | RedisService |
| `src/vector-search/knowledge-loader.service.spec.ts` | KnowledgeLoaderService |
| `src/vector-search/vector-search.service.spec.ts` | VectorSearchService |
| `src/api/agent/service/agent/agent.service.spec.ts` | AgentService |
| `src/api/agent/controller/agent.controller.spec.ts` | AgentController |

---

## Architecture Overview

```
User (browser)
    |
    | HTTP
    v
Next.js 16 Frontend  (port 3000)
    |
    | POST /api/agent/analyze
    v
NestJS API  (port 3001)
    |
    | invokes
    v
LangGraph ReAct Agent  [GPT-4o]
    |
    |-- ClassificationTool  -->  GPT-4o structured output
    |-- ExtractionTool      -->  GPT-4o JSON schema
    |-- KnowledgeTool       -->  Qdrant (Ada-002 embeddings, 63 chunks)
    |-- HistoricalTool      -->  PostgreSQL similarity query
    |
    | checkpoint read/write
    v
PostgreSQL  (port 5433)   Redis  (port 6379)   Qdrant  (port 6333)
```

The agent executes a Think → Act → Observe loop. At each step it selects one tool, reads its output, updates its internal state, and decides whether to call another tool or produce a final answer. All intermediate steps and the final state are persisted to PostgreSQL under the session's thread ID, enabling multi-turn conversation continuity.


## Team Bor3i

| Name |
|---|
| Yasser Chouket |
| Yassine Chouket |

---

## Technical Presentation

[AI Ticket Classifier — Technical Presentation.pdf](AI%20Ticket%20Classifier%20%E2%80%94%20Technical%20Presentation.pdf)

---

## Demo

<video src="DEMO.mp4" controls width="100%" style="border-radius:8px;border:1px solid #30363d;">
  Your browser does not support the video tag. Download the demo: <a href="DEMO.mp4">DEMO.mp4</a>
</video>
