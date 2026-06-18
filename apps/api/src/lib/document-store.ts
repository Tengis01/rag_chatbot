import { db } from "./db.js";

const documentTextStore = new Map<string, string>();

export function storeDocumentText(documentId: string, text: string): void {
    documentTextStore.set(documentId, text);
}

export function getDocumentText(documentId: string): string | undefined {
    return documentTextStore.get(documentId);
}

export function deleteDocumentText(documentId: string): void {
    documentTextStore.delete(documentId);
}

export type DocumentStatus = "pending" | "processing" | "ready" | "failed";

/**
 * Updates the processing status of a document in the database,
 * optionally updating the final chunk count.
 */
export async function updateDocumentStatus(
  documentId: string,
  status: DocumentStatus,
  chunkCount?: number
): Promise<void> {
  if (chunkCount !== undefined) {
    await db.query(
      `UPDATE documents
       SET status = $2, chunk_count = $3, updated_at = NOW()
       WHERE id = $1`,
      [documentId, status, chunkCount]
    );
  } else {
    await db.query(
      `UPDATE documents
       SET status = $2, updated_at = NOW()
       WHERE id = $1`,
      [documentId, status]
    );
  }
}

/**
 * Retrieves a document by its unique ID.
 */
export async function getDocumentById(documentId: string) {
  const result = await db.query(
    "SELECT * FROM documents WHERE id = $1",
    [documentId]
  );
  return result.rows[0] ?? null;
}