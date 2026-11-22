# Reusable Project Engineering Instructions

## Purpose

These are the default engineering rules for every project in this repository. Follow them unless the user explicitly requests a different approach or the existing project has a documented conflicting convention.

## 1. Determine the Project Scope

At the start of a new project, determine whether the work is frontend-only, backend-only, or fullstack.

If the user or repository already makes the scope clear, do not ask again. If it is unclear, ask exactly one question:

> Is this project frontend-only, backend-only, or fullstack?

Apply only the relevant sections. For fullstack projects, apply the frontend, backend, and API-contract rules.

## 2. General Working Rules

- Inspect the repository before creating files or changing architecture.
- Preserve established conventions unless the user requests a migration.
- Briefly explain the architecture before implementing a major feature.
- Write complete, production-ready, typed, secure, maintainable code.
- Follow Clean Code, SOLID, and separation of concerns.
- Avoid pseudocode and placeholders when the required information exists.
- Do not duplicate business logic across components, views, serializers, hooks, or stores.
- Do not add dependencies when the existing stack can solve the problem cleanly.
- Never create both npm and pnpm lockfiles.
- Run relevant type checks, linting, and tests after changes.
- Report any command or test that could not be run.

## 3. Package Management

- Prefer `pnpm` for new JavaScript or TypeScript projects.
- If an existing project uses npm, continue using npm unless asked to migrate.
- Respect the existing lockfile:
  - `pnpm-lock.yaml` means pnpm.
  - `package-lock.json` means npm.
- Never mix package managers in one project.


## 4. VS Code Tasks and Fixed Development Ports

Every project should include a committed `.vscode/tasks.json` that can start the project from VS Code without manually retyping commands.

### Port rules

- Assign a fixed, project-specific development port when creating a new project.
- Ports should differ between projects to reduce conflicts when several projects run at once.
- For fullstack projects, assign separate fixed ports for the frontend and backend.
- Check existing environment files, scripts, documentation, and tasks before choosing ports.
- If the user already provided ports, use them.
- Otherwise, choose uncommon available development ports and record them clearly.
- Once a project port is established, do not silently change it.
- Never terminate another process merely to take its port. Report the conflict or deliberately update the project configuration.
- Keep all port references synchronized across `.vscode/tasks.json`, package scripts, environment files, CORS settings, CSRF trusted origins, callback URLs, and documentation.

### Task rules

Frontend-only projects should have a task such as:

```text
Start frontend
```

Backend-only projects should have a task such as:

```text
Start backend
```

Fullstack projects should normally have:

```text
Start frontend
Start backend
Start project
```

`Start project` should be a compound task that starts the frontend and backend in parallel.

Use the package manager already selected for the repository. Prefer `pnpm` for new frontend projects.

Example fullstack `.vscode/tasks.json`:

```jsonc
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start frontend",
      "type": "shell",
      "command": "pnpm dev -- --port 4317",
      "options": {
        "cwd": "${workspaceFolder}/frontend"
      },
      "isBackground": true,
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "dedicated",
        "clear": false
      }
    },
    {
      "label": "Start backend",
      "type": "shell",
      "command": "python manage.py runserver 127.0.0.1:8317",
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "isBackground": true,
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "dedicated",
        "clear": false
      }
    },
    {
      "label": "Start project",
      "dependsOn": [
        "Start backend",
        "Start frontend"
      ],
      "dependsOrder": "parallel",
      "problemMatcher": []
    }
  ]
}
```

The numbers above are examples only. Each real project must receive its own fixed ports.

## 5. Frontend Technology Standard

Use these defaults for new frontend projects:

- Next.js App Router
- TypeScript with strict typing
- `src/` directory
- Tailwind CSS
- ShadCN UI
- React Hook Form
- Zod
- TanStack Query for server state, queries, and mutations
- Zustand for client and editor state
- Vitest and React Testing Library
- Playwright when end-to-end testing is needed
- pnpm

Use Server Components by default. Add `"use client"` only when interaction, browser APIs, React state, client hooks, or client libraries require it.

## 6. Frontend Folder Structure

Use this base structure when the project needs the relevant folders:

```text
src/
├── app/
├── components/
│   ├── ui/
│   ├── shared/
│   ├── site/
│   ├── admin/
│   └── dashboard/
├── api/
├── hooks/
├── stores/
├── schemas/
├── types/
├── lib/
├── config/
└── utils/
```

Do not create empty folders merely to match the example.

## 7. Mirror App Routes Inside Components

Mirror route organization from `src/app` inside `src/components`.

```text
src/app/(site)/page.tsx
→ src/components/site/home/

src/app/(site)/about/page.tsx
→ src/components/site/about/

src/app/(admin)/templates/page.tsx
→ src/components/admin/templates/

src/app/(dashboard)/settings/page.tsx
→ src/components/dashboard/settings/
```

Rules:

- Remove route-group parentheses in the matching component path.
- Use `home/` for the root `page.tsx` of a route group.
- Keep route files small and focused on composition and route-level server work.
- Put ShadCN primitives in `components/ui/`.
- Put application-wide reusable components in `components/shared/`.
- Put route-specific components in the mirrored route folder.

## 8. Frontend Data and State Layers

Use this flow:

```text
API function → TanStack Query hook → page/component
                         ↓
                    cache updates
```

### `src/api/`

- Store raw backend communication here.
- Create one configured client in `api/client.ts`.
- Group endpoints by domain instead of one large endpoint file.

```text
src/api/
├── client.ts
├── auth.ts
├── users.ts
├── products.ts
├── orders.ts
└── payments.ts
```

API modules must not contain React hooks or UI state.

### `src/hooks/`

- Put TanStack Query queries and mutations here.
- Group hooks by domain.
- Use descriptive names beginning with `use`.

```text
src/hooks/
├── auth/
│   ├── useLogin.ts
│   ├── useLogout.ts
│   └── useCurrentUser.ts
└── products/
    ├── useProducts.ts
    ├── useProduct.ts
    └── useCreateProduct.ts
```

### `src/stores/`

- Use Zustand for client state, not as a replacement for TanStack Query.
- Group stores by product area when useful.

```text
src/stores/
├── admin/
├── site/
├── user/
└── commerce/
```

Good Zustand use cases include selected editor nodes, panels, canvas zoom, unsaved local changes, temporary cart state, and UI preferences.

Backend-owned data such as users, products, orders, and templates should normally remain in TanStack Query.

## 9. Forms, Schemas, and Types

Use React Hook Form with Zod and ShadCN form components.

- Put runtime validation in `src/schemas/`.
- Put shared TypeScript structures in `src/types/`.
- Infer form input types from Zod schemas instead of duplicating structures.

```ts
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

Use Zod for forms, critical API responses, environment variables, local-storage data, and builder JSON.

Use normal TypeScript types for component props, store state, utility types, and trusted compile-time structures.

## 10. Django Backend Standard

For new Django backends:

- Name the project configuration package `serverConfig`.
- Use one main Django application named `api`.
- Organize `api` by layer.
- Split each layer into domain files such as `user.py`, `product.py`, and `order.py`.

```text
backend/
├── manage.py
├── serverConfig/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
└── api/
    ├── models/
    ├── serializers/
    ├── views/
    ├── urls/
    ├── services/
    ├── selectors/
    ├── permissions/
    ├── signals/
    ├── tasks/
    ├── admin/
    ├── tests/
    └── apps.py
```

Example:

```text
api/models/user.py
api/serializers/user.py
api/views/user.py
api/urls/user.py
api/services/user.py
api/selectors/user.py
api/tests/test_user.py
```

Import split models from `api/models/__init__.py` so Django discovers them. Combine domain URL modules through `api/urls.py`.

## 11. Django Responsibility Rules

- Models define persistence rules and small model-specific behavior.
- Serializers validate and transform API data.
- Views coordinate HTTP requests and responses.
- Services contain writes, workflows, transactions, and business logic.
- Selectors contain reusable read/query logic.
- Permissions control access.
- Signals are for decoupled side effects, not essential workflows.
- Tasks contain asynchronous work.
- Keep views, serializers, and models thin.

For admin CRUD APIs:

- Use `ModelViewSet` for full CRUD resources.
- Use `GenericViewSet` with selected mixins when only some operations are allowed.
- Use custom actions or dedicated endpoints for commands such as approve, publish, cancel, refund, or archive.
- Put command logic in services.
- Apply explicit permissions to every admin endpoint.

## 12. Authentication Standard

For normal browser-based Next.js and Django applications, prefer:

- Django session authentication
- Secure HTTP-only session cookies
- CSRF protection
- `dj-rest-auth` for standard auth endpoints when suitable
- A same-origin Next.js proxy or backend-for-frontend route when practical

Required flow:

1. Frontend requests a CSRF endpoint.
2. Django ensures the CSRF cookie exists.
3. Frontend sends credentials with requests.
4. Unsafe requests send `X-CSRFToken`.
5. Login creates the HTTP-only session cookie.
6. Logout destroys the server-side session.

Use standard DRF `SessionAuthentication` unless there is a proven reason to customize it. Protect login and other anonymous unsafe endpoints with CSRF explicitly.

Use JWT only for a real token requirement such as mobile apps, third-party API clients, or service-to-service authentication. Do not add JWT merely to avoid configuring CSRF.

Production auth must use HTTPS, secure cookies, trusted origins, strict permissions, suitable rate limits, and tests for login, logout, CSRF rejection, session expiry, and unauthorized access.

## 13. OpenAPI Contract

For fullstack projects:

- Use `drf-spectacular` to generate the Django OpenAPI schema.
- Treat OpenAPI as the frontend-backend contract.
- Generate TypeScript API types or a typed client from it.
- Frontend code must use generated types rather than guessing response shapes.
- Regenerate the schema and types whenever serializers or endpoints change.
- Add CI checks for stale generated types or schema drift.
- Use Zod for runtime validation where required; OpenAPI types provide compile-time safety.

## 14. Testing and Quality

Frontend:

- Test utilities, stores, hooks, and important components with Vitest.
- Use React Testing Library for user-facing component behavior.
- Use Playwright for critical end-to-end flows.

Backend:

- Test services, selectors, permissions, serializers, and API behavior.
- Include authentication, authorization, validation, and tenant-isolation tests when relevant.
- Test admin ViewSet permissions and custom actions.

Before completion:

- Run formatting and linting.
- Run TypeScript checks.
- Run relevant unit and integration tests.
- Run Django checks and migration checks when models change.
- Verify generated OpenAPI types when API contracts change.

## 15. Security Rules

- Never expose secrets in frontend code.
- Never store sensitive auth tokens in local storage when secure cookies are available.
- Validate all untrusted input.
- Enforce authorization on the backend regardless of frontend route protection.
- Use database transactions for multi-step writes.
- Avoid mass assignment and unrestricted serializer fields.
- Rate-limit authentication, forms, payments, uploads, and public actions where appropriate.
- Validate uploaded file type, size, and ownership.
- Do not trust client-provided tenant, owner, role, price, payment status, or permission values.
- Keep dependencies updated and avoid unnecessary packages.

## 16. Implementation Workflow

Before implementation:

1. Inspect the repository and existing conventions.
2. Determine frontend, backend, or fullstack scope.
3. Identify affected routes, domains, models, API contracts, and tests.
4. Reuse existing modules before creating new ones.
5. Briefly state the architecture for substantial features.

During implementation:

1. Keep each layer within its responsibility.
2. Update types and schemas with the implementation.
3. Handle loading, empty, success, and error states.
4. Add authorization and validation at the backend boundary.
5. Add or update tests.

After implementation:

1. Run the relevant checks.
2. Fix failures caused by the change.
3. Summarize changed files and important decisions.
4. Clearly disclose unverified behavior.

## 17. Project-Specific Overrides

Project requirements may extend this guide. Add them below or in a nearer nested `AGENTS.md`. More specific project instructions take priority, but do not silently abandon these defaults.

### Fernway banking app

- **Product:** consumer fintech for US-dollar customers: checking, high-yield savings, debit/virtual cards, ACH / same-day ACH / wire transfers, moves between own accounts, and crypto (BTC, ETH, SOL, USDC). Locale `en-US`, currency `USD`.
- **Scope:** fullstack. `frontend/` is built (UI first).
- **Backend (user decision, overrides sections 10–13):** no Django. The backend is the Next.js server inside `frontend/` (route handlers / server actions) with **Drizzle ORM on PostgreSQL**. Keep the layering from section 11 in TypeScript: `src/server/db/` (schema, client, migrations), `src/server/services/` (writes, transactions, business rules), `src/server/selectors/` (reads), thin route handlers. Session auth with HTTP-only cookies and CSRF protection on unsafe requests (section 12 still applies). Port `8729` is no longer needed while the backend runs inside Next. Local database: a project-only PostgreSQL 16 cluster in `frontend/.data/pg` (git-ignored) on `127.0.0.1:5729`, trust auth, no password; `pnpm db:start` / `db:stop` / `db:generate` / `db:migrate` / `db:studio`. Migrations live in `frontend/drizzle/`. The admin login comes from `pnpm db:seed` run through `envsafe run -f` on the frontend's local env file (reads `ADMIN_EMAIL`, `ADMIN_PASSWORD`). Route handlers use `handler()` from `src/server/http.ts` (CSRF double-submit + Origin check, `{ detail, errors }` error shape, `unstable_rethrow` for Next signals). Balances are never stored: they are the sum of the ledger, and writes that would take an account below $0 are refused. Customer-initiated debits (transfers, moves, crypto buys) must also fit the *available* balance (pending money in can't be spent). Crypto holdings are never stored either: they are the sum of `crypto_trades`, each linked to the cash transaction that paid for it (deleting that transaction deletes the trade). Every screen now reads the server; there is no in-browser data source left.
- **Ports (fixed, do not change silently):** frontend `4729`, backend `8729`. Keep them in sync across `.vscode/tasks.json`, `frontend/package.json`, `frontend/.env.example`, and the trusted origins used for CSRF checks (`http://localhost:4729`, `http://127.0.0.1:4729`).
- **Routes:** `(site)` public homepage at `/` (components in `components/site/`); `(auth)` `/sign-in` and `/sign-up` share one layout; `(dashboard)` app at `/overview`, `/transactions`, `/transfers`, `/cards`, `/crypto`. Homepage rates and fees live in `src/config/marketing.ts`; keep them equal to what the API enforces.
- **Public website look:** the `(site)` homepage follows a reference layout the user chose (top bar, gradient logo block with updates strip, hero slider, beige/navy alternating sections). It has its own palette and fonts: flame `#c2410c`, ember `#9a3412`, amber `#f59e0b`, navy `#1a1c23`, beige `#f7f1eb`, body text `#7f7873`; DM Sans headings (`font-dm`), Manrope body (`font-body`); content width `site-container` (1170px), header/hero `site-container-wide` (50px side margins). It is always light. The logged-in app uses the same orange/amber brand (see Design system). Photos in `public/images/site/` are Unsplash (see CREDITS.md); never reuse another site's images or copy.
- **Compliance copy:** the footer states Fernway is a financial technology company, not a bank, and carries the APY and crypto risk disclosures. Add the partner bank name and "Member FDIC" line only once a real partner bank exists. Never claim FDIC insurance, rates or features the product does not have.
- **Package manager:** pnpm, inside `frontend/` only.
- **Next.js 16 with Cache Components on.** Read `frontend/node_modules/next/dist/docs/` before using a Next API you have not checked; see `frontend/AGENTS.md`. Never call `Math.random()` or `Date.now()` during render in prerendered components (it breaks the build).
- **Money:** always integer cents end to end. Format only through `src/lib/money.ts`. Never use floats for balances. Crypto quantities are floats of whole coins; their USD values are cents (`src/lib/crypto.ts`). Fees, arrival dates, trade quotes and balance checks are backend-owned; the UI shows the quote it is given.
- **Banking rules already encoded:** ABA routing checksum (`src/lib/routing.ts`), wire minimum $100, method fees ACH $0 / same-day ACH $2 / wire $15, crypto fee 1.25% (min $0.99), trade minimum $10, 6-digit verification step for outgoing transfers. The server enforces all of these (`src/server/services/transfers.ts`, `trading.ts`, `banks.ts`); keep API errors field-keyed (`fieldErrors.amount` etc.) so forms show them inline.
- **Data source:** each `src/api/<domain>.ts` function calls the server through `apiRequest(...)`. The in-browser sample data (`src/api/local/`) is gone; never bring it back. Shared money rules live in `src/lib/transfers.ts` (fees, limits, arrival times) and `src/lib/trades.ts` (trade fee, quotes, positions) so the server and the UI quote the same numbers.
- **Crypto prices:** live from CoinGecko's free public API via `src/server/services/prices.ts` (requests spaced 1.5 s apart, at most two series per coin, cached in memory on `globalThis`, warmed at startup by `src/instrumentation-node.ts`). If the API is down, charts fall back to the last good data or flat reference prices, but trades refuse any price that isn't real and under 15 minutes old. The admin records past buys at the real market price of that moment (`Record a crypto buy`); the admin never types a price or a coin balance.
- **Support email (user decision):** set by the admin at `/admin/settings` (table `site_settings`, one row). Never hard-code a contact address. Use `IfSupportEmail` / `SupportEmailLink` / `SupportEmailAddress` from `components/shared/support-email.tsx`; when no email is set, every contact link and the support panel are hidden. Support hours are not shown (none are staffed yet).
- **SMS codes:** transfer confirmation accepts a 6-digit verification code.
- **Auth:** section 12 is implemented: HTTP-only session cookie, CSRF double-submit plus Origin check, `src/proxy.ts` redirects signed-out visitors away from the app, and every API route checks the session (`requireUser` / `requireAdmin`).
- **Invitation only (user decision):** there is no public sign-up. Customers exist only when the admin creates them; there is no register endpoint, and `/sign-up` is an "invitation only" notice that the site's "Open an account" buttons lead to. Do not add self sign-up back until the user says the product is live.
- **Admin console:** an `/admin` area where the owner creates customers, opens accounts and enters transactions; balances are always derived from transactions. Never build tooling to set arbitrary balances outside the transaction ledger.
- **Naming:** the history page is "Transactions" everywhere, never "Activity". Rows say "Money in" / "Money out".
- **Mobile feels native:** below `md`, overlays open as swipe-down bottom sheets via `components/shared/responsive-modal.tsx` (vaul Drawer); use it instead of raw Sheet/Dialog for new overlays. Bottom tab bar with short labels (`shortLabel` in `config/site.ts`), horizontally swiping stat cards, round quick-action buttons. The dashboard main area is white in light mode.
- **UI kit:** use shadcn components first (Sidebar, Card, Item, Table, Chart, Field, InputGroup, InputOTP, RadioGroup, ToggleGroup, Tabs, Sheet, Dialog, Drawer, Badge, Empty, Spinner, Skeleton). Add missing ones with `pnpm dlx shadcn@latest add <name>` rather than hand-rolling.
- **Design system & 10 Predefined Themes:** Default theme is the signature orange/amber brand in light and dark (`next-themes`, default `light`): `brand` (`#9a3412`), `primary` (`#c2410c`), `accent` (`#f59e0b`). Fernway Vault uses this same color theme by default. 10 predefined themes are available in `src/config/themes.ts` (Fernway Ember default, Electric Blue, Emerald Forest, Royal Amethyst, Obsidian Midnight, Rose Gold & Champagne, Sunset Coral, Cyber Cyan, Crimson Ruby, Slate Titanium). The admin can assign any of these 10 themes to any customer from `/admin/customers/[id]` under the "Theme" tab; `ThemeSync` dynamically applies the customer's theme variables across both Banking and Vault.
- **Quick sign-in is local only (user decision):** the one-click sign-in box (`components/auth/quick-login-helper.tsx`, `/api/auth/quick-login`) exists only under `pnpm dev` and answers only requests made to `localhost`; production builds drop it (`LOCAL_QUICK_SIGN_IN` in `src/config/features.ts`). Never add an endpoint that signs someone in without a password, or one that lists users to the public.
- **Vault is switched off (user decision, 2026-11-10):** `VAULT_ENABLED = false` in `src/config/features.ts`; the proxy redirects `/vault` to `/` and answers its APIs with 404, and the sidebar/admin hide it. Before turning it back on, keep holdings derived from recorded transactions and avoid collecting recovery phrases on the server.
- **Fernway Invest (user decision, 2026-11-14):** a third, **separate app** at `/invest` (switch `INVEST_ENABLED` in `src/config/features.ts`; an `invest.*` host serves it at `/`, ready for its own domain). It is not connected to Banking or the Vault in any way, and must stay that way: its own customers (`invest_users`, created only by the admin at `/admin/invest`, invitation only), its own sign-in `/invest/sign-in` with its own session table and cookie `fw_invest_session`, its own cash. Never link between the apps, read the banking user, or share themes with Invest. Only `/admin` is shared.
  - **Money rules:** investing cash is the sum of `invest_cash_entries` (a requested withdrawal is held at once as a pending debit; cash never goes below $0). Holdings are the sum of `invest_trades`, each linked to its cash entry; trades use live prices only (same 15-minute rule) and the crypto fee from `lib/trades.ts`. Quotes come from the server (`src/lib/invest.ts`, `src/server/services/invest.ts`). The admin can never add, edit or delete an Invest customer's money, holdings or transactions; money moves only through confirmed deposits, trades and withdrawals, and those rows are never deleted.
  - **Managed portfolios:** the admin picks a mix of BTC/ETH/SOL/USDC in basis points (total 10,000). There is no return, APY or performance field, and none may be added. Changing a mix affects new investments only; a portfolio anyone has used can't be deleted, only unpublished (holders can still withdraw).
  - **Deposits are real (user decision: live):** CryptAPI gives each customer one address per coin (`btc`, `eth`, `sol/sol`, `sol/usdc`) that forwards to the company wallet set in `/admin/invest/settings`, gated by the admin's "Deposits open" switch. Cash is credited only from a CryptAPI callback (`/api/invest/cryptapi/callback`) with a valid `x-ca-signature` (key pinned in `src/server/services/cryptapi.ts`) and a known nonce, once per payment, at the live price of the coins forwarded. Needs `INVEST_PUBLIC_URL` (https) on the server and that domain verified at cryptapi.io.
  - **Withdrawals:** the customer requests one (coin, address, USD amount); the admin sends it by hand from the company wallet and marks it paid with the transaction ID, or declines it with a reason shown to the customer (the money returns to their cash). The customer can cancel while it is requested.
  - **Copy:** Invest takes real money, so it shows no "Demo" badge. Its footer states Fernway is not a bank, broker-dealer or registered investment adviser, crypto is not FDIC- or SIPC-insured, and no return is promised. Keep that true.
- **Single Unified Admin for all platforms:** The `/admin` portal is the single central management hub for all apps (Fernway Banking accounts/cards/bills/transactions, Fernway Vault crypto wallets/holdings/staking/NFTs, and customer themes), designed to scale seamlessly as more sites and platforms are added.
- **Checks before finishing frontend work:** `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` in `frontend/`.
- **Never run `pnpm build` while `pnpm dev` is running:** they share `frontend/.next`, and the dev server's cache gets corrupted (pages reload themselves in a loop with "HMR hash mismatch"). Stop the dev server first; if it already happened, stop it, delete `frontend/.next`, start again.
- **No filler or unbacked claims (investors flagged this):** every sentence on the site and in the app must be true of the product as built. Fernway is not a bank: never call it one ("your bank", "the bank that…"). Don't promise features that don't exist (statements, disputes, lost-card replacement, SMS codes, mailed cards), use real company names in mockups, or add sample personas (no "Jordan", "Northwind"). New copy describes only what a customer can actually do.
