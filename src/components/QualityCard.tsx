import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, BookOpen } from "lucide-react";

export type Quality = {
  faithfulness: { score: number; rationale: string };
  coherence: { score: number; rationale: string };
  readability: { score: number; rationale: string };
};

export function QualityCard({ quality }: { quality: Quality }) {
  const items = [
    { key: "faithfulness", label: "Faithfulness", icon: ShieldCheck, data: quality.faithfulness },
    { key: "coherence", label: "Coherence", icon: Sparkles, data: quality.coherence },
    { key: "readability", label: "Readability", icon: BookOpen, data: quality.readability },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="rounded-2xl border border-border bg-card p-6 shadow-elegant"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Quality check</h2>
        <span className="text-xs text-muted-foreground">AI-evaluated</span>
      </div>
      <div className="space-y-5">
        {items.map(({ key, label, icon: Icon, data }) => (
          <div key={key}>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <span className="text-sm font-semibold tabular-nums">{Math.round(data.score)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, data.score))}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-primary"
              />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{data.rationale}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
