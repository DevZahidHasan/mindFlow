# MINDSPACE

MINDSPACE is an AI-powered visual knowledge operating system designed to merge notes, semantic search, interactive 3D graphs, and timeline-based discovery into a premium mobile-first editorial interface.

## 1. Project Vision
To build a portfolio-grade, production-quality frontend application demonstrating cutting-edge UI/UX interaction design, physical animations, clean layered architecture, and strict security and accessibility principles.

## 2. Technology Stack
* **Framework**: Next.js 16 (App Router)
* **Runtime / Compiler**: React 19
* **Language**: TypeScript (`strict: true`)
* **Styling**: Tailwind CSS v4
* **Forms & Validation**: React Hook Form, Zod
* **Code Quality**: ESLint, Prettier

## 3. Architecture Overview
MINDSPACE enforces a layered architecture to keep responsibilities separate and maintainable:
* **UI Layer**: React components and pages focused on layout, style, interactions, and accessibility.
* **Request Boundaries**: Next.js Server Actions and Route Handlers handling validation, authentication checks, and input boundaries.
* **Domain Services**: Reusable domain logic, business rules, and service orchestration.
* **Repositories**: Data persistence, fetching logic, and direct database adapters (Supabase/PostgreSQL).

## 4. Development Setup
To run the project locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build the production application:
   ```bash
   npm run build
   ```

4. Perform linting & typechecking:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```

## 5. Environment Setup
The project uses environment variables for configuration. Copy the example file to get started:
```bash
cp .env.example .env.local
```
*(Refer to `.env.example` for required configuration variables).*

## 6. Project Structure
The repository structure is organized as follows:
```text
src/
├── app/          # Next.js App Router (pages and layouts)
├── components/   # UI elements (ui/ for primitive elements, shared/ for common blocks)
├── features/     # Feature-oriented modular components (lazy-loaded where possible)
├── lib/          # Utilities, services, repositories, validations, and custom errors
│   ├── errors/   # Centralized error model and normalization
│   ├── repositories/ # Database and persistence adapters
│   ├── services/ # Business rules and workflow services
│   ├── utils/    # General helper functions
│   └── validations/ # Zod validation schemas
├── context/      # React Context providers (used selectively)
├── types/        # TypeScript global type definitions
└── styles/       # Tailwind CSS global styles
```

## 7. Development Principles & Governance
* **TypeScript Strict**: `strict: true` is enabled. A strict **ZERO `any`** policy is enforced.
* **State Discipline**: React Context is used only when necessary. No third-party state libraries (Zustand, Redux, TanStack Query) are allowed without approval.
* **Error Handling**: All errors are normalized to a standard `AppError` format. Sensitive database errors are never exposed to the client.
* **Mobile First**: Minimum touch targets are `44px × 44px`. Responsive structures are built starting from small viewports.
* **Agent Guidelines**: Coding agents must consult `AGENTS.md` and `PROJECT_PROGRESS.md` before starting tasks.

## 8. Current Project Status
* **Current Phase**: Phase 0 — Project Initialization
* **Status**: Complete (Project initialized, configurations verified, directory layout established).
* **Next Steps**: Phase 1 — Product Architecture & Design System.
