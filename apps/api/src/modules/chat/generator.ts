import type { RetrievedChunk } from "../retrieval/retrieval.service.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

interface GeminiGenerateResponse {
  candidates?: {
    content?: {
      parts?: { text?: string; thought?: boolean }[];
    };
  }[];
}

const SYSTEM_INSTRUCTION =
  "Та баримтын туслах. Хэрэглэгчийн асуултад зөвхөн өгөгдсөн баримтын context ашиглан монголоор хариул. Хариулт context дотор байхгүй бол тодорхой хэл. Товч, ойлгомжтой бай.";

async function tryGenerate(
  modelName: string,
  userQuestion: string,
  context: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: `Context:\n${context}\n\nQuestion: ${userQuestion}` }],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini generateContent ${modelName} model дээр амжилтгүй боллоо [${res.status}]: ${errText}`);
  }

  const data = (await res.json()) as GeminiGenerateResponse;
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textPart = parts.find((p) => !p.thought);
  const text = textPart?.text?.trim() || parts[0]?.text?.trim();

  if (!text) {
    throw new Error(`Gemini generateContent ${modelName} model дээр хоосон хариу буцаалаа`);
  }

  return text;
}

export async function generateAnswer(
  userQuestion: string,
  contextChunks: RetrievedChunk[]
): Promise<string> {
  const context = contextChunks.map((chunk) => chunk.content).join("\n\n---\n\n");

  const models = ["gemini-3.5-flash", "gemini-2.0-flash", "gemma-4-31b-it"];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      return await tryGenerate(model, userQuestion, context);
    } catch (err) {
      lastError = err as Error;
      // Log to console for tracing but proceed to fallback
      console.warn(`${model} model-оор хариулт үүсгэж чадсангүй:`, lastError.message);
    }
  }

  throw new Error(`Бүх generation model амжилтгүй боллоо. Сүүлийн алдаа: ${lastError?.message}`);
}
