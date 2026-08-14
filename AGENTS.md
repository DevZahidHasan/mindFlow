# MINDSPACE — Agent Memory & Governance

Welcome! This is the persistent instruction manual and memory system for all AI coding agents working on MINDSPACE. Read this file completely before editing the codebase.

## 1. Project Identity & Mission
* **What MINDSPACE is**: An AI-powered visual knowledge operating system combining notes, semantic search, knowledge graphs, interactive 3D visualizations (WebGL), and projects in a premium mobile-first editorial interface.
* **Mission**: Build a portfolio-grade, production-quality frontend application demonstrating cutting-edge UI/UX interaction design, clean layered architecture, and strict engineering discipline.

## 2. Technical Stack
* **Core**: Next.js (App Router), React 19, TypeScript (`strict: true`), Tailwind CSS v4.
* **Forms & Validation**: React Hook Form, Zod.
* **Database & Auth (Future)**: Supabase, PostgreSQL, Supabase Auth, Row-Level Security (RLS).
* **State Management**: Zero external state libraries. Use Server Components, Server Actions, route handlers, state/reducer hook primitives, and React Context sparingly. Do NOT install Zustand, TanStack Query, Redux, etc.

## 3. Target Layered Architecture
Ensure clear separation of concerns and follow strict import directions:
```
UI (Components / Pages)
 ↓
Server Components / Client Components (Layout, event triggers, path state)
 ↓
Server Actions / Route Handlers (Zod schema validations, authentication boundaries)
 ↓
Domain Services (Core business rules, service orchestration, error mapping)
 ↓
Repositories (Raw queries, SQL schema joins, direct Supabase adapters)
 ↓
Supabase / PostgreSQL
```
* **Dependency Constraints**: UI components must never import Repositories or run direct DB operations. Server Actions and Route Handlers must validate inputs and verify authority before invoking Services. Services must map database entities to domain models and catch database exceptions to normalize them.
* **Feature Directories**: Features are encapsulated in `src/features/[featureName]/` containing component, schema, action, service, repository, and type subfolders as required.

## 4. Non-Negotiable Rules
* **TypeScript Strict Mode**: `strict: true` must remain enabled.
* **Zero any Policy**: Never use `any` or `as any`. Address typing challenges with interfaces, generics, discriminated unions, or type guards.
* **State Discipline**: React Context must not store high-frequency mutating business data. Use URL query strings (`?tab=...`) to represent view states and standard React hooks for component UI status.
* **Security & Auth First**: Never trust client-provided workspace/user IDs. Validate workspace membership inside the Request boundary before fetching. Secure variables.
* **Mobile-First Layouts**: Design mobile first, then scale to desktop. Minimum touch targets must be `44px × 44px`. Use gesture-friendly sheets and drawers on mobile viewports.
* **Accessibility (a11y)**: Use semantic HTML, keyboard focus management (visible focus rings required), and screen-reader support. The visual 3D Knowledge Universe must provide a screen-reader-accessible hierarchical textual view fallback.
* **Animations & Motion**: Leverage physics-based motion with weight, inertia, and high damping. Never use snappy, overly reactive, or bouncy overshooting animations. Optimize for deliberate, expensive-feeling settling tails (e.g. `cubic-bezier(0.16, 1, 0.3, 1)` easing). Respect the motion budget (1 primary, max 2 supporting animations per viewport; others remain stable) and default duration levels: Micro-controls (180–280ms), Component sliders/drawers (450–700ms), Major spatial shifts (700–1200ms), and Cinematic storytelling reveals (1000–1800ms). Custom cursor and interactive springs must immediately fall back to static states under `prefers-reduced-motion: reduce`.
* **Performance & WebGL Boundaries**: WebGL/R3F must be restricted to the visual canvas (e.g. Universe Mode) and dynamically loaded with SSR disabled. Text notes, forms, sidebars, settings, and command palette must be rendered using standard DOM/CSS.
* **Error Flow**: Raw database/auth errors must be caught at the Domain Service layer and normalized into the standard `AppError` payload format before returning to the UI to prevent database details leakage.
* **UI Primitives Isolation**: Core UI primitives (e.g. Button, Input, Dialog, Sheet, Tabs, Tooltip) must remain framework-agnostic. Keep validation engines (Zod), form bindings (React Hook Form), or Server Actions decoupled from component definitions.
* **Database & Domain Strictness**: `knowledge_nodes` is the canonical knowledge entity, and `knowledge_edges` is the canonical relationship entity. All knowledge entities are strict workspace-scoped. Database RLS is mandatory for all access. Repositories are the only direct database layer. AI semantic relationships are NOT created during node creation; node and edge operations remain distinct at the domain level.
* **Semantic Intelligence**: MINDSPACE uses a Groq-Only RAG Architecture. The application utilizes PostgreSQL-native Full-Text Search (FTS) with GIN indexes on `searchable_content tsvector` within a dedicated `knowledge_chunks` table for retrieval. Embeddings (OpenAI) and vector storage have been completely removed.
* **AI Tooling**: External AI providers are strictly limited to Groq. Do not install OpenAI, Hugging Face, or vector database libraries.

## 5. Agent Development Workflow
All agents must follow this sequential loop:
1. **Read `AGENTS.md`** to align on rules and stack.
2. **Read `PROJECT_PROGRESS.md`** to understand the current task, status, and decisions.
3. **Inspect the existing repository** to confirm the actual code status (do not assume).
4. **Plan implementation** in `implementation_plan.md` and get human approval (unless task is trivial).
5. **Implement** changes carefully.
6. **Verify** using:
   - TypeScript: `npx tsc --noEmit`
   - ESLint: `npm run lint`
   - Production Build: `npm run build`
7. **Fix issues** and repeat verification.
8. **Update `PROJECT_PROGRESS.md`** with completed tasks and phase transitions.
9. **Report completion** clearly and stop.

## 6. Current Project State
* Phase 9 (WebGL / 3D Knowledge Experience) is COMPLETE.
* Phase 10 (AI Search & Intelligence Engine) is COMPLETE.
* Phase 11 (AI Assistant & Command Center) is COMPLETE.
* Phase 12 (Projects, Collections & Timeline) is PLANNED.
* Refer to [PROJECT_PROGRESS.md](file:///d:/ai_integration/mindFlow/PROJECT_PROGRESS.md) for current phase, roadmap, and recent decisions.
