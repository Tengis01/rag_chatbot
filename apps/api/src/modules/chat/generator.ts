import { pause } from "../../shared/deadline.js";
import { config } from "../../shared/config.js";
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
  "Та баримтын туслах. Хэрэглэгчийн асуултад зөвхөн өгөгдсөн баримтын context ашиглан хариул. Хариулт бичихдээ баримтын хэл болон бичгийн системийг дагаж бич — баримт кирилл монгол бол кирилл монголоор, латин бол бас кирилл монголоор хариул. Харин англи бол англиар гэх мэтчилэн. Асуулт ямар ч хэлээр байсан хамаагүй. Хариулт context дотор байхгүй бол тодорхой хэл. Товч, ойлгомжтой бай.";

async function tryGenerate(
  modelName: string,
  userQuestion: string,
  context: string,
  signal: AbortSignal,
  attempt = 0
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    signal,
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

  if ((res.status === 429 || res.status === 503) && attempt < 1) {
    await res.body?.cancel();
    await pause(2000, signal);
    return tryGenerate(modelName, userQuestion, context, signal, attempt + 1);
  }

  if (!res.ok) {
    await res.body?.cancel();
    throw new Error(
      `Gemini generateContent ${modelName} model дээр амжилтгүй боллоо [${res.status}]`
    );
  }

  const data = (await res.json()) as GeminiGenerateResponse;
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textPart = parts.find((p) => !p.thought);
  const text = textPart?.text?.trim() || parts[0]?.text?.trim();

  if (!text) {
    throw new Error(
      `Gemini generateContent ${modelName} model дээр хоосон хариу буцаалаа`
    );
  }

  return text;
}

export async function generateAnswer(
  userQuestion: string,
  contextChunks: RetrievedChunk[],
  signal: AbortSignal = AbortSignal.timeout(config.chatTimeoutMs)
): Promise<string> {
  const context = contextChunks.map((chunk) => chunk.content).join("\n\n---\n\n");

  const models = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",      // stable GA, найдвартай fallback
  "gemini-2.5-flash-lite", // хямд, хурдан гурав дахь fallback
];

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      signal.throwIfAborted();
      return await tryGenerate(model, userQuestion, context, signal);
    } catch (err) {
      signal.throwIfAborted();
      lastError = err as Error;
      // Log to console for tracing but proceed to fallback
      console.warn(`${model} model-оор хариулт үүсгэж чадсангүй:`, lastError.message);
    }
  }

  throw new Error(`Бүх generation model амжилтгүй боллоо. Сүүлийн алдаа: ${lastError?.message}`);
}
