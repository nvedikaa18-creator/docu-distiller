import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check } from "lucide-react";

export type Stage = "idle" | "extracting" | "chunking" | "summarizing" | "evaluating" | "done" | "error";

const STEPS: { id: Stage; label: string }[] = [
  { id: "extracting", label: "Extracting text" },
  { id: "chunking", label: "Smart chunking" },
  { id: "summarizing", label: "AI summarizing" },
  { id: "evaluating", label: "Quality check" },
];

const order: Stage[] = ["idle", "extracting", "chunking", "summarizing", "evaluating", "done"];

export function ProgressStepper({ stage }: { stage: Stage }) {
  if (stage === "idle" || stage === "error") return null;
  const currentIdx = order.indexOf(stage);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="rounded-2xl border border-border bg-card p-5 shadow-elegant"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STEPS.map((step) => {
            const stepIdx = order.indexOf(step.id);
            const active = stepIdx === currentIdx;
            const complete = stepIdx < currentIdx;
            return (
              <div
                key={step.id}
                className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2"
              >
                <div className="flex h-6 w-6 items-center justify-center">
                  {complete ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : active ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  )}
                </div>
                <span
                  className={
                    active
                      ? "text-sm font-medium text-foreground"
                      : complete
                      ? "text-sm text-foreground/80"
                      : "text-sm text-muted-foreground"
                  }
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
