/**
 * Document processing pipeline.
 *
 * Status flow: pending → processing → ready
 *                                   → failed (on error)
 */

import { chunkText } from "./chunker.js";
import { embedTexts } from "./embedder.js";
import { storeChunks } from "./vector-store.js";
import { deleteDocumentText, updateDocumentStatus } from "./document-store.js";

export async function processDocument(
  documentId: string,
  extractedText: string
): Promise<void> {
  try {
    // 1. Mark as processing
    await updateDocumentStatus(documentId, "processing");

    // 2. Split into chunks
    const chunks = chunkText(extractedText);
    if (chunks.length === 0) {
      throw new Error("chunkText produced 0 chunks — document text may be empty");
    }

    // 3. Generate embeddings for all chunks (batched internally)
    const embeddings = await embedTexts(chunks.map((c) => c.text));

    // 4. Persist chunks + vectors
    await storeChunks(documentId, chunks, embeddings);

    // 5. Mark ready
    await updateDocumentStatus(documentId, "ready", chunks.length);

    console.log(
      `[pipeline] document ${documentId} ready — ${chunks.length} chunks`
    );
  } catch (err) {
    console.error(`[pipeline] document ${documentId} failed:`, err);
    // Best-effort status update; ignore secondary failure
    await updateDocumentStatus(documentId, "failed").catch(() => {});
    throw err;
  } finally {
    deleteDocumentText(documentId);
  }
}
