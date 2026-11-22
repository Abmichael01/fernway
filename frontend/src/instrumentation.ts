/**
 * Runs once when the server starts. Node-only setup lives in `instrumentation-node.ts` and is
 * imported only in the Node.js runtime, as the Next.js docs require.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
}
