import { setTimeout } from "node:timers/promises";

export async function pause(ms: number, signal?: AbortSignal): Promise<void> {
  await setTimeout(ms, undefined, { signal });
}

export function requestSignal(parent?: AbortSignal, timeoutMs = 30_000): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  return parent ? AbortSignal.any([parent, timeout]) : timeout;
}
