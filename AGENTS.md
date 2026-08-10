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
Ensure clear separation of concerns:
```
UI (Components / Pages)
 ↓
Server Components / Client Components (Fetch wrappers, state handlers)
 ↓
Server Actions / Route Handlers (Request boundaries, auth check, validation)
 ↓
Domain Services (Orchestration, business logic, workflows)
 ↓
Repositories (Database access, raw queries, Supabase clients)
 ↓
Supabase / PostgreSQL
```
* **Constraint**: Do not put complex business logic directly in React components. Do not write raw queries in UI components.

## 4. Non-Negotiable Rules
* **TypeScript Strict Mode**: `strict: true` must remain enabled.
* **Zero any Policy**: Never use `any` or `as any`. Address typing challenges with interfaces, generics, discriminated unions, or type guards.
* **State Discipline**: React Context must not become a global replacement for state.
* **Security First**: Validate all inputs at request boundaries. Never trust client-provided user IDs. Secure all variables.
* **Mobile-First Layouts**: Design mobile first, then scale to desktop. Minimum touch targets must be `44px × 44px`.
* **Accessibility (a11y)**: Use semantic HTML, keyboard focus management, and screen-reader support. Never compromise accessibility for visual effects.
* **Animations**: Leverage physics-based motion (spring, velocity, drag, shared-element, scroll-linked). Animations must serve a UX purpose, not just looking impressive.
* **Performance**: Lazy load heavy libraries (like 3D/WebGL). Keep bundle size small. Optimize frame rates and GPU usage.

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
* Refer to [PROJECT_PROGRESS.md](file:///d:/ai_integration/mindFlow/PROJECT_PROGRESS.md) for current phase, roadmap, and recent decisions.
