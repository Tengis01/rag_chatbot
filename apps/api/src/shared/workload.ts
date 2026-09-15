import { existsSync } from "node:fs";
import { config } from "./config.js";

/** One process only: reserve before extraction/DB writes and release after ingestion. */
export class Workload {
  private users = new Set<string>();
  constructor(private limit: number, private isDraining: () => boolean) {}
  get active() { return this.users.size; }
  acquire(userId: string): (() => void) | undefined {
    if (this.isDraining() || this.users.size >= this.limit || this.users.has(userId)) return undefined;
    this.users.add(userId);
    let released = false;
    return () => { if (!released) this.users.delete(userId); released = true; };
  }
}

export const isDraining = () => Boolean(config.drainFile && existsSync(config.drainFile));
export const ingestionWork = new Workload(2, isDraining);
export const chatWork = new Workload(4, isDraining);
