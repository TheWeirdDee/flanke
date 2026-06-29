/**
 * Flanke — dual-model AI classifier. LOCKED (PRD §6, §14).
 *
 * Primary:  Gemini 2.5 Flash (@google/generative-ai)
 * Fallback: Groq llama-3.3-70b-versatile (OpenAI-compatible REST)
 * Both fail → safe default UNKNOWN_CHANGE / importance 1.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { SIGNAL_TYPES, type Classification, type SignalType, type UrlType } from "@/types";

const GEMINI_MODEL = "gemini-2.5-flash";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const SAFE_DEFAULT: Classification = {
  signalType: "UNKNOWN_CHANGE",
  importanceScore: 1,
  summary: "Classification unavailable.",
};

const SIGNAL_SET = new Set<string>(SIGNAL_TYPES);

function clampScore(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(10, Math.max(1, Math.round(n)));
}

function coerceSignal(value: unknown): SignalType {
  return typeof value === "string" && SIGNAL_SET.has(value)
    ? (value as SignalType)
    : "UNKNOWN_CHANGE";
}

function buildPrompt(
  diffAdded: string[],
  diffRemoved: string[],
  competitorName: string,
  urlType: UrlType,
): string {
  return [
    "You are a competitive-intelligence analyst for B2B sales teams.",
    `A monitored ${urlType} page for the competitor "${competitorName}" changed.`,
    "Classify the change into exactly one signal type and write a single-sentence",
    "summary a sales rep can act on.",
    "",
    `Allowed signalType values (use exactly one): ${SIGNAL_TYPES.join(", ")}.`,
    "",
    "ADDED CONTENT:",
    diffAdded.join("\n") || "(none)",
    "",
    "REMOVED CONTENT:",
    diffRemoved.join("\n") || "(none)",
    "",
    "Respond with ONLY valid minified JSON, no markdown, no code fences, of the shape:",
    '{"signalType": <one allowed value>, "importanceScore": <integer 1-10>, "summary": <one sentence>}',
  ].join("\n");
}

/** Pull the first JSON object out of a model response (tolerates code fences). */
function parseJson(raw: string): Classification | null {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    const parsed: unknown = JSON.parse(cleaned.slice(start, end + 1));
    if (typeof parsed !== "object" || parsed === null) return null;
    const obj = parsed as Record<string, unknown>;
    return {
      signalType: coerceSignal(obj.signalType),
      importanceScore: clampScore(obj.importanceScore),
      summary:
        typeof obj.summary === "string" && obj.summary.trim().length > 0
          ? obj.summary.trim()
          : "Change detected.",
    };
  } catch {
    return null;
  }
}

async function classifyWithGemini(prompt: string): Promise<Classification | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
  });

  const result = await model.generateContent(prompt);
  return parseJson(result.response.text());
}

async function classifyWithGroq(prompt: string): Promise<Classification | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You output only valid JSON." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) return null;

  const data: unknown = await res.json();
  const content =
    typeof data === "object" && data !== null
      ? (data as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message
          ?.content
      : undefined;

  return typeof content === "string" ? parseJson(content) : null;
}

/**
 * Classify a detected change. Tries Gemini, then Groq, then the safe default.
 * Never throws — classification must never drop an event (PRD §14).
 */
export async function classifyChange(
  diffAdded: string[],
  diffRemoved: string[],
  competitorName: string,
  urlType: UrlType,
): Promise<Classification> {
  const prompt = buildPrompt(diffAdded, diffRemoved, competitorName, urlType);

  try {
    const gemini = await classifyWithGemini(prompt);
    if (gemini) return gemini;
  } catch (err) {
    console.warn("[classifier] Gemini failed, falling back to Groq:", err);
  }

  try {
    const groq = await classifyWithGroq(prompt);
    if (groq) return groq;
  } catch (err) {
    console.warn("[classifier] Groq failed, using safe default:", err);
  }

  return { ...SAFE_DEFAULT };
}
