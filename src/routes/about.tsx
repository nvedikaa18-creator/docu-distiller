import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import {
  FileSearch,
  Scissors,
  Bot,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How it works — Synthesize.AI" },
      {
        name: "description",
        content:
          "Architecture and prompt design behind Synthesize.AI: chunking, map-reduce summarization, and AI-evaluated quality scoring.",
      },
    ],
  }),
  component: About,
});

function About() {
  const steps = [
    {
      icon: FileSearch,
      title: "Extract",
      desc: "PDF and TXT files are parsed in your browser using pdf.js — your file never leaves the page until summarization.",
    },
    {
      icon: Scissors,
      title: "Chunk",
      desc: "Long documents are split into ~3K-token chunks with overlap, so nothing important is lost across boundaries.",
    },
    {
      icon: Bot,
      title: "Summarize (map-reduce)",
      desc: "Each chunk is summarized in parallel with a 'professional research analyst' persona, then reduced into one cohesive structured summary.",
    },
    {
      icon: ShieldCheck,
      title: "Evaluate",
      desc: "A second model pass scores faithfulness, coherence, and readability (0–100) with a one-line rationale for each.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            How <span className="text-gradient">Synthesize.AI</span> works
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            A small, focused pipeline that turns long-form text into actionable insights — using
            structured prompts and an AI-evaluated quality check.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-6 px-4 pb-24 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-6 shadow-elegant"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">Step {i + 1}</span>
              </div>
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display text-lg font-semibold">Prompt design</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="text-foreground">Persona:</span> "Act as a professional research
              analyst."
            </li>
            <li>
              <span className="text-foreground">Structured output:</span> tool-calling enforces a
              JSON schema with <code>keyPoints</code>, <code>insights</code>,{" "}
              <code>conclusion</code>.
            </li>
            <li>
              <span className="text-foreground">Length control:</span> short / medium / detailed
              changes the target counts in the reduce prompt.
            </li>
            <li>
              <span className="text-foreground">Multi-language:</span> the model is instructed to
              respond in the user's chosen language.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <h3 className="mb-3 font-display text-lg font-semibold">Stack</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Frontend: React 19 + TanStack Start + Tailwind v4</li>
            <li>• Backend: TanStack server functions (typed RPC)</li>
            <li>• AI: Lovable AI Gateway (Google Gemini)</li>
            <li>• PDF parsing: pdf.js (in-browser)</li>
            <li>• Animation: framer-motion</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
