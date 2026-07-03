/**
 * Gemini embedding via REST API (not SDK) to avoid version compatibility issues.
 *
 * Endpoint: POST https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=KEY
 * Request:  { requests: [{ model: "models/gemini-embedding-001", content: { parts: [{ text }] }, outputDimensionality: 768 }] }
 * Response: { embeddings: [{ values: number[] }] }  — 768-dimensional vectors
 *
 * Free-tier hardening (ERR-027): a single batch of ~50 chunks (~23k tokens)
 * gets an instant 429 RESOURCE_EXHAUSTED. So batches are token-budgeted and
 * paced, with exponential-backoff retry on 429/5xx. A 500k-char document
 * (~400 chunks) is expected to take a few minutes — the pipeline is async
 * and clients poll status, so slow-but-successful beats failing.
 */

import { estimateTokens } from "./chunker.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const BATCH_EMBED_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${GEMINI_API_KEY}`;

const MAX_ITEMS_PER_BATCH = 15;
const TOKEN_BUDGET_PER_BATCH = 6_000; // estimated tokens per request
const INTER_BATCH_DELAY_MS = 3_000; // base pacing between batches
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 8;
const MAX_BACKOFF_MS = 60_000;

interface GeminiBatchResponse {
  embeddings: { values: number[] }[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Split texts into batches capped by both item count and estimated tokens. */
function buildBatches(texts: string[]): string[][] {
  const batches: string[][] = [];
  let current: string[] = [];
  let currentTokens = 0;

  for (const text of texts) {
    const tokens = estimateTokens(text);
    const wouldOverflow =
      current.length >= MAX_ITEMS_PER_BATCH ||
      (current.length > 0 && currentTokens + tokens > TOKEN_BUDGET_PER_BATCH);

    if (wouldOverflow) {
      batches.push(current);
      current = [];
      currentTokens = 0;
    }
    current.push(text);
    currentTokens += tokens;
  }
  if (current.length > 0) batches.push(current);
  return batches;
}

/** Pull an explicit retry delay out of a Gemini error body, if present. */
function parseRetryDelayMs(errBody: string): number | null {
  const match = errBody.match(/"retryDelay":\s*"(\d+(?:\.\d+)?)s"/);
  return match ? Math.ceil(parseFloat(match[1]) * 1000) : null;
}

async function embedBatch(batch: string[]): Promise<number[][]> {
  const body = JSON.stringify({
    requests: batch.map((text) => ({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text }] },
      outputDimensionality: 768,
    })),
  });

  let lastError: Error = new Error("embedBatch: no attempts made");

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(BATCH_EMBED_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: controller.signal,
      });

      if (res.ok) {
        const data = (await res.json()) as GeminiBatchResponse;
        if (!data.embeddings || data.embeddings.length !== batch.length) {
          throw new Error(
            `Gemini returned ${data.embeddings?.length ?? 0} embeddings for ${batch.length} inputs`
          );
        }
        return data.embeddings.map((e) => e.values);
      }

      const errText = await res.text();
      lastError = new Error(
        `Gemini batchEmbedContents failed [${res.status}]: ${errText.slice(0, 500)}`
      );

      // Only rate limits / transient server errors are worth retrying
      if (res.status !== 429 && res.status < 500) throw lastError;

      const backoff =
        parseRetryDelayMs(errText) ??
        Math.min(2 ** attempt * 1000, MAX_BACKOFF_MS);
      const jitter = Math.random() * 1000;
      console.warn(
        `[embedder] ${res.status} on batch of ${batch.length}, attempt ${attempt}/${MAX_ATTEMPTS}, retrying in ${Math.round((backoff + jitter) / 1000)}s`
      );
      await sleep(backoff + jitter);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        lastError = new Error(`Gemini batchEmbedContents timed out after ${REQUEST_TIMEOUT_MS}ms`);
        await sleep(Math.min(2 ** attempt * 1000, MAX_BACKOFF_MS));
      } else if (err === lastError) {
        throw err; // non-retryable HTTP error from above
      } else {
        // network failure — retry with backoff
        lastError = err instanceof Error ? err : new Error(String(err));
        await sleep(Math.min(2 ** attempt * 1000, MAX_BACKOFF_MS));
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}

/**
 * Embed multiple texts in token-budgeted, paced batches.
 * Returns a parallel array of 768-dim float arrays.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const batches = buildBatches(texts);
  const results: number[][] = [];

  for (let i = 0; i < batches.length; i++) {
    if (i > 0) await sleep(INTER_BATCH_DELAY_MS);
    const embeddings = await embedBatch(batches[i]);
    results.push(...embeddings);
    if (batches.length > 1) {
      console.log(`[embedder] batch ${i + 1}/${batches.length} done (${results.length}/${texts.length} chunks)`);
    }
  }

  return results;
}

/**
 * Convenience wrapper — embed a single text string.
 */
export async function embedText(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text]);
  return embedding;
}
