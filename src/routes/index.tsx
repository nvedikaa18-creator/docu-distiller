import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import { Header } from "@/components/Header";
import { UploadCard } from "@/components/UploadCard";
import { ProgressStepper, type Stage } from "@/components/ProgressStepper";
import { SummaryCard, type Summary } from "@/components/SummaryCard";
import { QualityCard, type Quality } from "@/components/QualityCard";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { extractText, chunkText, previewWords } from "@/lib/document";
import { summarizeDocument, evaluateSummary } from "@/lib/summarize.functions";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Synthesize.AI — AI Document Summarizer" },
      {
        name: "description",
        content:
          "Turn long PDFs and text documents into structured, AI-generated summaries with quality scores. Built for students, researchers, and professionals.",
      },
      { property: "og:title", content: "Synthesize.AI — AI Document Summarizer" },
      {
        property: "og:description",
        content:
          "Drop a PDF or TXT and get key points, insights, and a conclusion in seconds.",
      },
    ],
  }),
  component: Index,
});

type Length = "short" | "medium" | "detailed";

function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const [length, setLength] = useState<Length>("medium");
  const [language, setLanguage] = useState<string>("English");
  const [stage, setStage] = useState<Stage>("idle");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [quality, setQuality] = useState<Quality | null>(null);

  // Extract text whenever a new file is selected
  useEffect(() => {
    if (!file) {
      setText("");
      setSummary(null);
      setQuality(null);
      setStage("idle");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setStage("extracting");
        const t = await extractText(file);
        if (cancelled) return;
        setText(t);
        setStage("idle");
      } catch (e) {
        if (cancelled) return;
        toast.error(e instanceof Error ? e.message : "Failed to read file");
        setStage("error");
        setFile(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const preview = useMemo(() => previewWords(text, 800), [text]);
  const wordCount = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);
  const busy = stage !== "idle" && stage !== "done" && stage !== "error";
  const canSummarize = !!file && text.length > 50 && !busy;

  const onSummarize = async () => {
    if (!text) return;
    try {
      setSummary(null);
      setQuality(null);
      setStage("chunking");
      const chunks = chunkText(text);
      if (chunks.length > 40) {
        toast.error("Document too large. Please split it.");
        setStage("error");
        return;
      }

      setStage("summarizing");
      const result = await summarizeDocument({ data: { chunks, length, language } });
      setSummary(result);

      setStage("evaluating");
      const evalText = [
        ...result.keyPoints.map((k) => `- ${k}`),
        ...result.insights.map((k) => `- ${k}`),
        result.conclusion,
      ].join("\n");
      const q = await evaluateSummary({ data: { source: text, summary: evalText } });
      setQuality(q);
      setStage("done");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Summarization failed");
      setStage("error");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toaster richColors position="top-center" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Powered by Lovable AI
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
              Read less.
              <br />
              <span className="text-gradient">Understand more.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Drop a PDF or text file and get a structured summary — key points, insights, and a
              conclusion — with an AI-evaluated quality score.
            </p>
          </motion.div>
        </div>
      </section>

      {/* App */}
      <section className="mx-auto max-w-6xl space-y-6 px-4 pb-24 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <UploadCard file={file} onFile={setFile} disabled={busy} />

            {/* Controls */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
              <h2 className="mb-4 font-display text-lg font-semibold">2. Choose summary style</h2>
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Length
                  </label>
                  <ToggleGroup
                    type="single"
                    value={length}
                    onValueChange={(v) => v && setLength(v as Length)}
                    className="grid grid-cols-3 gap-2"
                    disabled={busy}
                  >
                    <ToggleGroupItem value="short" className="rounded-lg">
                      Short
                    </ToggleGroupItem>
                    <ToggleGroupItem value="medium" className="rounded-lg">
                      Medium
                    </ToggleGroupItem>
                    <ToggleGroupItem value="detailed" className="rounded-lg">
                      Detailed
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Language
                  </label>
                  <Select value={language} onValueChange={setLanguage} disabled={busy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "English",
                        "Spanish",
                        "French",
                        "German",
                        "Hindi",
                        "Mandarin",
                        "Arabic",
                        "Portuguese",
                        "Japanese",
                      ].map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
                  disabled={!canSummarize}
                  onClick={onSummarize}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  {busy ? "Working…" : "Summarize"}
                </Button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Extracted text</h2>
              {text && (
                <span className="text-xs text-muted-foreground">
                  {wordCount.toLocaleString()} words
                </span>
              )}
            </div>
            <div className="h-[420px] overflow-y-auto rounded-xl bg-secondary/40 p-4 text-sm leading-relaxed text-foreground/90">
              {text ? (
                <p className="whitespace-pre-wrap">{preview}</p>
              ) : (
                <p className="text-muted-foreground">
                  Upload a PDF or TXT to preview its content here.
                </p>
              )}
            </div>
          </div>
        </div>

        <ProgressStepper stage={stage} />

        {summary && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SummaryCard summary={summary} fileName={file?.name} />
            </div>
            <div>{quality && <QualityCard quality={quality} />}</div>
          </div>
        )}
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        Built with Lovable AI · structured prompts · AI-evaluated quality
      </footer>
    </div>
  );
}
