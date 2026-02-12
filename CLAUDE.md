# CLAUDE.md - QueryFlow Development Guide

## Project Overview
QueryFlow is a natural language query interface for datasets. Users upload CSV, JSON, or SQL dumps and query them conversationally — no SQL knowledge required. The app translates plain English into SQL, executes it, and returns results with visualizations.

## Tech Stack

### Frontend (`/client`)
- React 18 + TypeScript
- Vite (build tool, dev server on port 5173)
- TailwindCSS (utility-first styling, mobile-first responsive design)
- Recharts (data visualization)
- React Query (server state management)
- Zustand (client state management)
- shadcn/ui (UI component library)
- Vitest + React Testing Library (unit/component tests)

### Testing
- Vitest — test runner for both client and server
- React Testing Library — component testing (user-centric, no implementation details)
- Supertest — API endpoint integration tests (server)
- MSW (Mock Service Worker) — API mocking in frontend tests

### Backend (`/server`)
- Node.js + Express + TypeScript
- MCP (Model Context Protocol) for standardized LLM communication
- OpenAI API (GPT-4) for natural language to SQL translation
- Supabase Client (database operations + file storage)
- PostgreSQL via Supabase (query execution)

### Infrastructure
- Vercel — frontend hosting
- Railway — backend/MCP server hosting
- Supabase — PostgreSQL + file storage + auth

## Development Commands
```bash
# Frontend
cd client && npm install    # Install frontend deps
cd client && npm run dev    # Start dev server (port 5173)
cd client && npm run build  # Production build
cd client && npm run lint   # Lint frontend code
cd client && npm run test   # Run frontend tests
cd client && npm run test:coverage  # Run tests with coverage report

# Backend
cd server && npm install    # Install backend deps
cd server && npm run dev    # Start dev server (port 3001)
cd server && npm run build  # Production build
cd server && npm run lint   # Lint backend code
cd server && npm run test   # Run backend tests
cd server && npm run test:coverage  # Run tests with coverage report
```

## Environment Variables

### Backend (`/server/.env`)
- `OPENAI_API_KEY` — OpenAI API key
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_KEY` — Supabase service role key
- `PORT` — Server port (default: 3001)
- `NODE_ENV` — Environment (development/production)
- `MCP_SERVER_URL` — MCP server URL (default: http://localhost:3002)

### Frontend (`/client/.env`)
- `VITE_API_URL` — Backend API URL (default: http://localhost:3001)
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key

## Code Conventions
- TypeScript strict mode in both client and server
- Functional React components with hooks (no class components)
- Named exports preferred over default exports
- Use `async/await` over raw promises
- Error handling: try/catch with meaningful error messages
- Keep components small and focused — extract logic into custom hooks
- API routes follow REST conventions: `/api/v1/<resource>`
- Use Zustand for client-only state, React Query for server state

## Responsive Design
- **Mobile-first approach** — design for small screens first, scale up with Tailwind breakpoints
- Tailwind breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- All layouts must work at 320px minimum width
- Touch-friendly targets: minimum 44x44px tap areas on interactive elements
- Data tables: horizontal scroll on mobile, full layout on desktop
- Charts: simplified/stacked view on mobile, full visualization on desktop
- File upload: full-width dropzone on mobile
- Navigation: collapsible hamburger menu on mobile, sidebar/topbar on desktop
- Test responsive behavior at key breakpoints during development

## Testing Guidelines
- **Write tests for all core functionality** — every feature should have corresponding tests
- Test files live next to source files: `Component.tsx` → `Component.test.tsx`
- Backend test files: `route.ts` → `route.test.ts`
- Naming convention: `describe("<ComponentOrModule>")` → `it("should <behavior>")`
- Prefer testing user-visible behavior over implementation details
- Mock external services (OpenAI, Supabase) — never call real APIs in tests
- Minimum coverage targets: 80% statements, 80% branches

### What to Test
**Frontend:**
- Component rendering and user interactions
- Form validation and error states
- Data display (tables, charts) with various data shapes
- File upload flow (drag-and-drop, file selection, validation)
- Query input and result display
- Responsive layout behavior at key breakpoints
- Zustand store state transitions
- React Query cache behavior and loading/error states

**Backend:**
- API endpoint request/response (happy path + error cases)
- Input validation and sanitization
- MCP tool definitions and LLM request formatting
- SQL generation and validation
- File parsing (CSV, JSON, SQL dump)
- Authentication and authorization
- Rate limiting behavior

## Architecture Principles
- **MCP as LLM abstraction** — all LLM communication goes through MCP tool definitions for standardization and extensibility
- **Supabase as unified backend** — database, file storage, and auth in one service
- **Session-first privacy** — data is session-only by default, no persistent storage unless opted in
- **Input sanitization** — all user inputs and generated SQL must be validated before execution

## Project Structure
```
queryflow/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   └── __tests__/     # or colocated .test.tsx files
│   │   ├── hooks/             # Custom React hooks
│   │   ├── stores/            # Zustand stores
│   │   ├── services/          # API client functions
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   └── test/              # Test setup, MSW handlers, fixtures
│   └── vitest.config.ts
├── server/                    # Express backend + MCP server
│   ├── src/
│   │   ├── routes/            # Express route handlers
│   │   ├── services/          # Business logic
│   │   ├── mcp/               # MCP tool definitions and server
│   │   ├── middleware/        # Express middleware
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   └── __tests__/         # or colocated .test.ts files
│   └── vitest.config.ts
├── README.md
└── CLAUDE.md
```

## Current Phase
Phase 2: Enhanced Queries (in progress). MVP features (CSV upload, basic NL-to-SQL, table visualization, query history) are complete. Working on JSON support, chart visualizations, follow-up questions, MCP streaming, responsive mobile design, and comprehensive test coverage.

## Git Workflow
- Branch naming: `feature/<name>`, `fix/<name>`, `refactor/<name>`
- Commit messages: concise, imperative tense (e.g., "Add chart visualization component")
- PR required for main branch
