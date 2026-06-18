/**
 * Gemini embedding via REST API (not SDK) to avoid version compatibility issues.
 *
 * Endpoint: POST https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=KEY
 * Request:  { requests: [{ model: "models/gemini-embedding-001", content: { parts: [{ text }] }, outputDimensionality: 768 }] }
 * Response: { embeddings: [{ values: number[] }] }  — 768-dimensional vectors
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const BATCH_EMBED_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${GEMINI_API_KEY}`;

const BATCH_SIZE = 100; // Gemini max per request

interface GeminiBatchResponse {
  embeddings: { values: number[] }[];
}

/**
 * Embed multiple texts in batches of 100.
 * Returns a parallel array of 768-dim float arrays.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const body = {
      requests: batch.map((text) => ({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text }] },
        outputDimensionality: 768,
      })),
    };

    const res = await fetch(BATCH_EMBED_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(
        `Gemini batchEmbedContents failed [${res.status}]: ${errText}`
      );
    }

    const data = (await res.json()) as GeminiBatchResponse;

    if (!data.embeddings || data.embeddings.length !== batch.length) {
      throw new Error(
        `Gemini returned ${data.embeddings?.length ?? 0} embeddings for ${batch.length} inputs`
      );
    }

    results.push(...data.embeddings.map((e) => e.values));
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