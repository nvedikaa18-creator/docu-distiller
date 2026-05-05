import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Download, Lightbulb, Target, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";

export type Summary = {
  keyPoints: string[];
  insights: string[];
  conclusion: string;
};

function summaryToText(s: Summary) {
  return [
    "KEY POINTS",
    ...s.keyPoints.map((k) => `• ${k}`),
    "",
    "IMPORTANT INSIGHTS",
    ...s.insights.map((k) => `• ${k}`),
    "",
    "CONCLUSION",
    s.conclusion,
  ].join("\n");
}

export function SummaryCard({ summary, fileName }: { summary: Summary; fileName?: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(summaryToText(summary));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const onDownload = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const width = doc.internal.pageSize.getWidth() - margin * 2;
    let y = margin;
    const writeBlock = (title: string, body: string[]) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(title, margin, y);
      y += 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      for (const line of body) {
        const wrapped = doc.splitTextToSize(line, width);
        if (y + wrapped.length * 14 > 800) {
          doc.addPage();
          y = margin;
        }
        doc.text(wrapped, margin, y);
        y += wrapped.length * 14 + 4;
      }
      y += 10;
    };
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("AI Document Summary", margin, y);
    y += 24;
    if (fileName) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text(`Source: ${fileName}`, margin, y);
      y += 18;
    }
    writeBlock(
      "Key Points",
      summary.keyPoints.map((k) => `• ${k}`),
    );
    writeBlock(
      "Important Insights",
      summary.insights.map((k) => `• ${k}`),
    );
    writeBlock("Conclusion", [summary.conclusion]);
    doc.save(`${fileName?.replace(/\.[^.]+$/, "") ?? "summary"}-summary.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-border bg-card p-6 shadow-elegant"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Summary</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCopy}>
            {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="mr-1 h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-2">
        <Section icon={<Target className="h-4 w-4" />} title="Key Points">
          <ul className="space-y-2">
            {summary.keyPoints.map((k, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-primary" />
                <span>{k}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={<Lightbulb className="h-4 w-4" />} title="Important Insights">
          <ul className="space-y-2">
            {summary.insights.map((k, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-primary" />
                <span>{k}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={<Flag className="h-4 w-4" />} title="Conclusion">
          <p className="text-sm leading-relaxed text-foreground/90">{summary.conclusion}</p>
        </Section>
      </div>
    </motion.div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
          {icon}
        </div>
        <h3 className="font-display text-base font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
