/**
 * pgvector chunk storage and similarity search.
 *
 * Embeddings are passed as a Postgres vector literal string "[x,y,z,...]"
 * and cast with $N::vector so pg doesn't need any special driver extension.
 */

import { db } from "./db.js";
import type { Chunk } from "./chunker.js";

const INSERT_BATCH = 50;

/**
 * Delete all chunks for a document (used for idempotent re-processing).
 */
export async function deleteChunks(documentId: string): Promise<void> {
  await db.query("DELETE FROM chunks WHERE document_id = $1", [documentId]);
}

/**
 * Store chunks + their embeddings into the `chunks` table.
 * Deletes any existing chunks first (idempotent).
 * Inserts in batches of INSERT_BATCH inside a single transaction.
 *
 * user_id is resolved by joining documents so we never hard-code it here.
 */
export async function storeChunks(
  documentId: string,
  chunks: Chunk[],
  embeddings: number[][]
): Promise<void> {
  if (chunks.length === 0) return;
  if (chunks.length !== embeddings.length) {
    throw new Error(
      `storeChunks: chunk count (${chunks.length}) !== embedding count (${embeddings.length})`
    );
  }

  await deleteChunks(documentId);

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    for (let i = 0; i < chunks.length; i += INSERT_BATCH) {
      const batchChunks = chunks.slice(i, i + INSERT_BATCH);
      const batchEmbeds = embeddings.slice(i, i + INSERT_BATCH);

      for (let j = 0; j < batchChunks.length; j++) {
        const chunk = batchChunks[j];
        const embeddingStr = `[${batchEmbeds[j].join(",")}]`;

        await client.query(
          `INSERT INTO chunks (document_id, user_id, content, chunk_index, token_count, embedding)
           SELECT $1, d.user_id, $2, $3, $4, $5::vector
           FROM documents d WHERE d.id = $1`,
          [documentId, chunk.text, chunk.chunkIndex, chunk.tokenEstimate, embeddingStr]
        );
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Cosine similarity search across a set of documents.
 * Returns top-K results with score >= minScore.
 */
export async function matchChunks(
  queryEmbedding: number[],
  documentIds: string[],
  topK = 5,
  minScore = 0.5
): Promise<{ chunkId: string; documentId: string; content: string; score: number }[]> {
  if (documentIds.length === 0) return [];

  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const result = await db.query(
    `SELECT
       id,
       document_id,
       content,
       1 - (embedding <=> $1::vector) AS score
     FROM chunks
     WHERE document_id = ANY($2)
       AND 1 - (embedding <=> $1::vector) >= $3
     ORDER BY embedding <=> $1::vector
     LIMIT $4`,
    [embeddingStr, documentIds, minScore, topK]
  );

  return result.rows.map((row) => ({
    chunkId: row.id as string,
    documentId: row.document_id as string,
    content: row.content as string,
    score: Number(row.score),
  }));
}