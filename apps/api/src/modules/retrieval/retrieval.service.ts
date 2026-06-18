import { db } from "../../shared/db/db.js";

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  content: string;
  page: number | null;
  chunkIndex: number | null;
  similarity: number;
}

function vectorLiteral(values: number[]): string {
  return `[${values.join(",")}]`;
}

function wordSet(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.replace(/[^\p{L}\p{N}_-]/gu, ""))
      .filter((word) => word.length > 2)
  );
}

function jaccardSimilarity(a: string, b: string): number {
  const wordsA = wordSet(a);
  const wordsB = wordSet(b);

  if (wordsA.size === 0 && wordsB.size === 0) return 0;

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }

  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

function rerankWithMmr(
  candidates: RetrievedChunk[],
  k: number,
  lambda: number
): RetrievedChunk[] {
  const selected: RetrievedChunk[] = [];
  const remaining = [...candidates];

  while (selected.length < k && remaining.length > 0) {
    let winnerIndex = 0;
    let winnerScore = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const diversityPenalty =
        selected.length === 0
          ? 0
          : Math.max(
              ...selected.map((chunk) =>
                jaccardSimilarity(candidate.content, chunk.content)
              )
            );
      const score =
        selected.length === 0
          ? candidate.similarity
          : lambda * candidate.similarity - (1 - lambda) * diversityPenalty;

      if (score > winnerScore) {
        winnerScore = score;
        winnerIndex = i;
      }
    }

    const [winner] = remaining.splice(winnerIndex, 1);
    selected.push(winner);
  }

  return selected;
}

export async function retrieveChunks(
  queryEmbedding: number[],
  userId: string,
  documentIds: string[],
  k = 5,
  threshold = 0.7,
  lambda = 0.7
): Promise<RetrievedChunk[]> {
  if (documentIds.length === 0) return [];

  const candidateCount = Math.max(20, k * 4);
  const result = await db.query(
    `SELECT id, document_id, content, page, chunk_index, similarity
     FROM match_chunks($1::vector, $2::uuid, $3::uuid[], $4, $5)`,
    [vectorLiteral(queryEmbedding), userId, documentIds, candidateCount, threshold]
  );

  const candidates = result.rows.map((row) => ({
    chunkId: row.id as string,
    documentId: row.document_id as string,
    content: row.content as string,
    page: row.page === null ? null : Number(row.page),
    chunkIndex: row.chunk_index === null ? null : Number(row.chunk_index),
    similarity: Number(row.similarity),
  }));

  return rerankWithMmr(candidates, k, lambda);
}
