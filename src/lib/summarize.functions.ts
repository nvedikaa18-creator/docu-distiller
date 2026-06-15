import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

const SummarizeInput = z.object({
  chunks: z.array(z.string().min(1)).min(1).max(40),
  length: z.enum(["short", "medium", "detailed"]),
  language: z.string().min(2).max(40).default("English"),
});

const EvaluateInput = z.object({
  source: z.string().min(1).max(120000),
  summary: z.string().min(1).max(20000),
});

const summarySchema = {
  type: "object",
  properties: {
    keyPoints: { type: "array", items: { type: "string" }, minItems: 3 },
    insights: { type: "array", items: { type: "string" }, minItems: 2 },
    conclusion: { type: "string" },
  },
  required: ["keyPoints", "insights", "conclusion"],
  additionalProperties: false,
};

async function callGateway(body: unknown) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add funds in Workspace Settings → Usage.");
    throw new Error(`AI gateway error (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

function lengthInstruction(length: "short" | "medium" | "detailed") {
  switch (length) {
    case "short":
      return "Aim for 3-5 key points, 2-3 insights, and a 1-2 sentence conclusion.";
    case "medium":
      return "Aim for 5-7 key points, 3-5 insights, and a 3-4 sentence conclusion.";
    case "detailed":
      return "Aim for 8-12 key points, 5-7 in-depth insights, and a 4-6 sentence conclusion.";
  }
}

async function summarizeChunk(chunk: string, language: string) {
  const data = await callGateway({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are a professional research analyst. Extract structured information from a document chunk. Be faithful to the source and avoid speculation.",
      },
      {
        role: "user",
        content: `Extract structured information from this document chunk. Respond in ${language}.\n\n---\n${chunk}\n---`,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "emit_chunk_summary",
          description: "Emit structured chunk summary",
          parameters: summarySchema,
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "emit_chunk_summary" } },
  });
  const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("Model returned no structured output");
  return JSON.parse(args) as { keyPoints: string[]; insights: string[]; conclusion: string };
}

export const summarizeDocument = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SummarizeInput.parse(d))
  .handler(async ({ data }) => {
    const { chunks, length, language } = data;

    // Map step (parallel, capped concurrency)
    const partials: Array<{ keyPoints: string[]; insights: string[]; conclusion: string }> = [];
    const concurrency = 4;
    for (let i = 0; i < chunks.length; i += concurrency) {
      const slice = chunks.slice(i, i + concurrency);
      const results = await Promise.all(slice.map((c) => summarizeChunk(c, language)));
      partials.push(...results);
    }

    // Reduce step
    const combined = partials
      .map(
        (p, i) =>
          `### Chunk ${i + 1}\nKey Points:\n- ${p.keyPoints.join("\n- ")}\nInsights:\n- ${p.insights.join("\n- ")}\nConclusion: ${p.conclusion}`,
      )
      .join("\n\n");

    const finalRes = await callGateway({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "Act as a professional research analyst. Synthesize partial chunk summaries into one cohesive, non-redundant final summary. Be faithful, precise, and avoid hallucination.",
        },
        {
          role: "user",
          content: `Synthesize the following chunk summaries into a single structured summary. Respond in ${language}. ${lengthInstruction(length)}\n\n${combined}`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "emit_final_summary",
            description: "Emit final structured summary",
            parameters: summarySchema,
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "emit_final_summary" } },
    });
    const args = finalRes?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("Model returned no final summary");
    return JSON.parse(args) as { keyPoints: string[]; insights: string[]; conclusion: string };
  });

const qualitySchema = {
  type: "object",
  properties: {
    faithfulness: {
      type: "object",
      properties: {
        score: { type: "number", minimum: 0, maximum: 100 },
        rationale: { type: "string" },
      },
      required: ["score", "rationale"],
    },
    coherence: {
      type: "object",
      properties: {
        score: { type: "number", minimum: 0, maximum: 100 },
        rationale: { type: "string" },
      },
      required: ["score", "rationale"],
    },
    readability: {
      type: "object",
      properties: {
        score: { type: "number", minimum: 0, maximum: 100 },
        rationale: { type: "string" },
      },
      required: ["score", "rationale"],
    },
  },
  required: ["faithfulness", "coherence", "readability"],
  additionalProperties: false,
};

export const evaluateSummary = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EvaluateInput.parse(d))
  .handler(async ({ data }) => {
    // Truncate source to keep prompt small
    const source = data.source.slice(0, 24000);
    const res = await callGateway({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a strict evaluator of AI-generated summaries. Score each dimension from 0 to 100 with a one-sentence rationale.",
        },
        {
          role: "user",
          content: `SOURCE (may be truncated):\n${source}\n\nSUMMARY:\n${data.summary}\n\nEvaluate faithfulness (does it match the source?), coherence (does it read logically?), and readability (is it clear and well structured?).`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "emit_quality",
            description: "Emit quality scores",
            parameters: qualitySchema,
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "emit_quality" } },
    });
    const args = res?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("Model returned no evaluation");
    return JSON.parse(args) as {
      faithfulness: { score: number; rationale: string };
      coherence: { score: number; rationale: string };
      readability: { score: number; rationale: string };
    };
  });
