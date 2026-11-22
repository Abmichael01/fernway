/**
 * Product switches. Change these deliberately; each one is explained in AGENTS.md.
 */

/**
 * The crypto Vault (`/vault`, its API and its admin screens) is switched off until rebuilt
 * with receive addresses and balances derived strictly from recorded transactions.
 */
export const VAULT_ENABLED = false;

/**
 * One-click "Quick sign-in" exists only while running `pnpm dev` on the owner's own computer.
 * A production build (`pnpm build`) drops it, and the server also refuses it from any other host.
 */
export const LOCAL_QUICK_SIGN_IN = process.env.NODE_ENV === "development";

/**
 * Fernway Invest (`/invest`, `/api/invest`, `/api/admin/invest` and its admin screens): a separate
 * app with its own customers, sign-in, cash ledger and holdings. Only the admin is shared.
 * Customer deposits are additionally gated by the admin's "Deposits open" setting.
 */
export const INVEST_ENABLED = true;
