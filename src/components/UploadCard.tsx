import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  file: File | null;
  onFile: (file: File | null) => void;
  disabled?: boolean;
};

export function UploadCard({ file, onFile, disabled }: Props) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSelect = useCallback(
    (f: File | null | undefined) => {
      if (!f) return;
      const ok =
        f.type === "application/pdf" ||
        f.type === "text/plain" ||
        /\.(pdf|txt)$/i.test(f.name);
      if (!ok) {
        alert("Please upload a PDF or TXT file.");
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        alert("File too large. Max 10 MB.");
        return;
      }
      onFile(f);
    },
    [onFile],
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant transition-shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">1. Upload document</h2>
        <span className="text-xs text-muted-foreground">PDF or TXT · max 10 MB</span>
      </div>

      {!file ? (
        <motion.label
          htmlFor="file-input"
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            onSelect(e.dataTransfer.files?.[0]);
          }}
          whileHover={{ scale: 1.005 }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
            drag ? "border-primary bg-accent/40" : "border-border hover:border-primary/50 hover:bg-accent/20",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
            <Upload className="h-5 w-5 text-primary-foreground" />
          </div>
          <p className="font-medium">Drop your file here or click to browse</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Research papers, articles, reports — anything text-heavy
          </p>
          <input
            ref={inputRef}
            id="file-input"
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            className="hidden"
            onChange={(e) => onSelect(e.target.files?.[0])}
            disabled={disabled}
          />
        </motion.label>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFile(null)}
            disabled={disabled}
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
