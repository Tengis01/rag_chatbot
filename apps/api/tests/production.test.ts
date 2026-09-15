import assert from "node:assert/strict";
import { test } from "node:test";
import { readConfig } from "../src/shared/config.js";
import { Workload } from "../src/shared/workload.js";

const env = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://test:test@postgres/test",
  GEMINI_API_KEY: "test-key-never-sent",
  BETTER_AUTH_SECRET: "a".repeat(64),
  FRONTEND_URL: "https://ragchatbot.dev",
  BETTER_AUTH_URL: "https://api.ragchatbot.dev",
};

test("production refuses missing secrets, insecure origins and unsupported limits", () => {
  assert.equal(readConfig(env).frontendURL, "https://ragchatbot.dev");
  for (const name of ["DATABASE_URL", "GEMINI_API_KEY", "BETTER_AUTH_SECRET", "FRONTEND_URL", "BETTER_AUTH_URL"]) {
    assert.throws(() => readConfig({ ...env, [name]: "" }), new RegExp(name));
  }
  for (const origin of ["http://ragchatbot.dev", "https://user:pass@ragchatbot.dev", "https://ragchatbot.dev/path"]) {
    assert.throws(() => readConfig({ ...env, FRONTEND_URL: origin }));
  }
  assert.throws(() => readConfig({ ...env, MAX_UPLOAD_SIZE_MB: "21" }));
  assert.throws(() => readConfig({ ...env, CHAT_TIMEOUT_MS: "125000" }));
  assert.equal(readConfig({ FRONTEND_URL: "http://localhost:5173" }).production, false);
});

test("admission rejects overlap and overload, drains existing jobs and can reopen", () => {
  let draining = false;
  const jobs = new Workload(2, () => draining);
  const first = jobs.acquire("one")!;
  assert.ok(first);
  assert.equal(jobs.acquire("one"), undefined);
  const second = jobs.acquire("two")!;
  assert.equal(jobs.acquire("three"), undefined);
  draining = true;
  first();
  assert.equal(jobs.acquire("three"), undefined);
  second();
  assert.equal(jobs.active, 0);
  draining = false;
  const next = jobs.acquire("one")!;
  first(); // repeated cleanup must not release a newer job
  assert.equal(jobs.active, 1);
  next();
});

test("chat deadline aborts retry waits and prevents additional Gemini calls", async () => {
  process.env.GEMINI_API_KEY = "test-key-never-sent";
  const { generateAnswer } = await import("../src/modules/chat/generator.js");
  const { embedText } = await import("../src/modules/ingestion/embedder.js");
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response("{}", { status: 429 }); };
  try {
    const start = Date.now();
    await assert.rejects(generateAnswer("test", [], AbortSignal.timeout(30)));
    assert.equal(calls, 1);
    assert.ok(Date.now() - start < 1000);
    calls = 0;
    await assert.rejects(embedText("test", AbortSignal.timeout(30)));
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = original;
  }
});
