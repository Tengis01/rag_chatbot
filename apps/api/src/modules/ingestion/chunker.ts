/**
 * Text chunker with Mongolian (Cyrillic) awareness.
 *
 * Token estimation:
 *   - Cyrillic-heavy text (>50% \u0400-\u04FF chars) → 2.5 chars/token
 *   - Latin text → 4 chars/token
 *
 * Smart break order: sentence boundary (.!? + space) → paragraph (\n\n) → newline → space
 */

export interface Chunk {
  chunkIndex: number;
  text: string;
  startChar: number;
  endChar: number;
  tokenEstimate: number;
}

const TARGET_TOKENS = 500;
const OVERLAP_RATIO = 0.15;

function detectCharsPerToken(text: string): number {
  const cyrillicCount = (text.match(/[\u0400-\u04FF]/g) ?? []).length;
  return cyrillicCount / text.length > 0.5 ? 2.5 : 4;
}

/** Rough token estimate (Cyrillic-aware) \u2014 also used for embed batch budgeting. */
export function estimateTokens(text: string): number {
  if (text.length === 0) return 0;
  return Math.ceil(text.length / detectCharsPerToken(text));
}

/**
 * Find the best break point at or before `maxEnd` in `text` starting from `start`.
 * Preference: sentence boundary > paragraph > newline > space.
 * Returns absolute index of the character AFTER the break (i.e. exclusive end).
 */
function findBreakPoint(text: string, start: number, maxEnd: number): number {
  const window = text.slice(start, maxEnd);

  // 1. Last sentence boundary: .  !  ?  followed by a space
  let best = -1;
  const sentenceRe = /[.!?][ \t]/g;
  let m: RegExpExecArray | null;
  while ((m = sentenceRe.exec(window)) !== null) {
    best = start + m.index + 2; // include the trailing space
  }
  if (best > start) return best;

  // 2. Last paragraph break
  const paraIdx = window.lastIndexOf("\n\n");
  if (paraIdx > 0) return start + paraIdx + 2;

  // 3. Last newline
  const nlIdx = window.lastIndexOf("\n");
  if (nlIdx > 0) return start + nlIdx + 1;

  // 4. Last space
  const spaceIdx = window.lastIndexOf(" ");
  if (spaceIdx > 0) return start + spaceIdx + 1;

  // 5. Hard cut
  return maxEnd;
}

export function chunkText(fullText: string): Chunk[] {
  if (!fullText || fullText.trim() === "") return [];

  const charsPerToken = detectCharsPerToken(fullText);
  const targetChars = Math.round(TARGET_TOKENS * charsPerToken);        // ~1250 for Mongolian, ~2000 for Latin
  const overlapChars = Math.round(targetChars * OVERLAP_RATIO);

  const chunks: Chunk[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < fullText.length) {
    const maxEnd = Math.min(start + targetChars, fullText.length);

    const end = maxEnd < fullText.length
      ? findBreakPoint(fullText, start, maxEnd)
      : fullText.length;

    const rawSlice = fullText.slice(start, end);
    const text = rawSlice.trim();

    if (text.length > 0) {
      const tokenEstimate = Math.ceil(text.length / charsPerToken);
      chunks.push({ chunkIndex, text, startChar: start, endChar: end, tokenEstimate });
      chunkIndex++;
    }

    // Next window starts (end - overlap) but must advance at least 1 char
    const nextStart = end - overlapChars;
    start = nextStart > start ? nextStart : end;
  }

  return chunks;
}