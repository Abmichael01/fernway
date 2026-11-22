# Fernway

US-dollar banking and crypto web app. The frontend is built first; the Django API comes next.

| Part | Folder | Dev port | Status |
| --- | --- | --- | --- |
| Web app (Next.js 16) | `frontend/` | 4729 | Built |
| API (Django + DRF) | `backend/` | 8729 | Not started |

## Run it

```bash
cd frontend
pnpm install
pnpm dev            # http://localhost:4729
```

In VS Code: **Terminal → Run Task → Start frontend**.

## Screens

- `/`: public homepage: accounts, rates and fees, security controls, how to open an account, FAQ
- `/sign-up`: open an account
- `/overview`: cash balance, this month in/out, weekly cash-flow chart, spending by category, recent activity, savings goal, upcoming bills, crypto snapshot
- `/transactions` (Activity): search and filter by direction, account and category; transaction details
- `/transfers` (Move money): pay anyone by routing and account number via ACH, same-day ACH or wire, with bank lookup, fee quote, 6-digit text code and receipt; move money between your own accounts
- `/cards`: freeze a card, turn online payments on or off, see monthly spend
- `/crypto`: portfolio value and return, price chart (1W–1Y), holdings table, buy and sell
- `/sign-in`

Light and dark themes follow the system setting; switch them from the header or the account menu.

## Checks

```bash
cd frontend
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## Connecting the backend

Every screen reads data through `frontend/src/api/<domain>.ts`. Those functions currently use an in-browser data source (`src/api/local/`). To connect Django, replace each function's body with a call to `apiRequest()` from `src/api/client.ts`, keeping the same signature. Hooks and components don't change. See section 17 of `AGENTS.md` for the conventions.
