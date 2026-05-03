"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Copy, Check } from "lucide-react";

export interface ResearchFinding {
  id: string;
  title: string;
  content: string;
  sources: string[];
  confidence: number;
  tags: string[];
  timestamp: Date;
}

type CitationFormat = "apa" | "chicago" | "mla" | "harvard" | "bibtex";

interface ResearchReportGeneratorProps {
  findings: ResearchFinding[];
  title: string;
  onExport?: (format: CitationFormat) => void;
  className?: string;
}

export function ResearchReportGenerator({
  findings,
  title,
  onExport,
  className = "",
}: ResearchReportGeneratorProps) {
  const [selectedFormat, setSelectedFormat] = useState<CitationFormat>("apa");
  const [copied, setCopied] = useState(false);

  const generateReport = (format: CitationFormat) => {
    switch (format) {
      case "apa":
        return generateAPA();
      case "chicago":
        return generateChicago();
      case "mla":
        return generateMLA();
      case "harvard":
        return generateHarvard();
      case "bibtex":
        return generateBibTeX();
      default:
        return "";
    }
  };

  const generateAPA = () => {
    let report = `# ${title}\n\n`;
    report += `**Report Generated:** ${new Date().toLocaleDateString()}\n`;
    report += `**Total Findings:** ${findings.length}\n\n`;

    findings.forEach((finding, idx) => {
      report += `## ${idx + 1}. ${finding.title}\n\n`;
      report += `${finding.content}\n\n`;
      report += `**Confidence Level:** ${(finding.confidence * 100).toFixed(0)}%\n`;
      report += `**Sources:** ${finding.sources.join(", ")}\n`;
      report += `**Tags:** ${finding.tags.join(", ")}\n\n`;
    });

    return report;
  };

  const generateChicago = () => {
    let report = `# ${title}\n\n`;
    report += `Generated on ${new Date().toLocaleDateString()}\n\n`;

    findings.forEach((finding, idx) => {
      report += `**${idx + 1}. ${finding.title}**\n\n`;
      report += `${finding.content}\n\n`;
      report += `Confidence: ${(finding.confidence * 100).toFixed(0)}%\n`;
      report += `Sources: ${finding.sources.join("; ")}\n\n`;
    });

    return report;
  };

  const generateMLA = () => {
    let report = `${title}\n\n`;
    report += `Date: ${new Date().toLocaleDateString()}\n\n`;

    findings.forEach((finding, idx) => {
      report += `${idx + 1}. "${finding.title}" ${finding.content}\n`;
      report += `Works Cited: ${finding.sources.join(". ")}\n\n`;
    });

    return report;
  };

  const generateHarvard = () => {
    let report = `# ${title}\n\n`;
    report += `Report Date: ${new Date().toLocaleDateString()}\n\n`;

    findings.forEach((finding) => {
      report += `### ${finding.title}\n`;
      report += `${finding.content}\n\n`;
      report += `Confidence: ${(finding.confidence * 100).toFixed(0)}%\n`;
      report += `Citation: ${finding.sources.map((s) => `(${s})`).join(" ")}\n\n`;
    });

    return report;
  };

  const generateBibTeX = () => {
    let report = `@misc{research_report_${Date.now()},\n`;
    report += `  title = {${title}},\n`;
    report += `  author = {OTIO Research Assistant},\n`;
    report += `  year = {${new Date().getFullYear()}},\n`;
    report += `  date = {${new Date().toISOString()}},\n`;
    report += `  note = {\n`;

    findings.forEach((finding) => {
      report += `    - ${finding.title}: ${finding.content}\n`;
    });

    report += `  }\n}\n`;
    return report;
  };

  const currentReport = generateReport(selectedFormat);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([currentReport], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `research-report-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onExport?.(selectedFormat);
  };

  const formats: { id: CitationFormat; label: string; description: string }[] = [
    { id: "apa", label: "APA", description: "American Psychological Association" },
    { id: "chicago", label: "Chicago", description: "Chicago Manual of Style" },
    { id: "mla", label: "MLA", description: "Modern Language Association" },
    { id: "harvard", label: "Harvard", description: "Harvard referencing" },
    { id: "bibtex", label: "BibTeX", description: "BibTeX format" },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-5 h-5 text-cohere-navy" />
        <h3 className="text-feature-heading font-body text-cohere-ink">
          Generate Report
        </h3>
      </div>

      {/* Format Selection */}
      <div>
        <p className="text-caption text-cohere-slate mb-3 uppercase tracking-wider">
          Citation Format
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`
                p-3 rounded-md border-2 transition-all text-center
                ${
                  selectedFormat === format.id
                    ? "border-cohere-coral bg-cohere-coral bg-opacity-10 text-cohere-coral"
                    : "border-cohere-hairline bg-cohere-white text-cohere-ink hover:border-cohere-coral"
                }
              `}
            >
              <div className="font-medium text-body">{format.label}</div>
              <div className="text-micro text-cohere-slate">{format.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <p className="text-caption text-cohere-slate mb-2 uppercase tracking-wider">
          Preview
        </p>
        <Card className="border-cohere-hairline bg-cohere-stone bg-opacity-50 p-4 max-h-64 overflow-y-auto">
          <pre className="text-micro text-cohere-ink whitespace-pre-wrap break-words font-mono">
            {currentReport.slice(0, 500)}
            {currentReport.length > 500 && "..."}
          </pre>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleCopy}
          className="flex-1 bg-cohere-blue hover:bg-cohere-blue hover:opacity-90 text-cohere-white rounded-pill"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </>
          )}
        </Button>
        <Button
          onClick={handleDownload}
          className="flex-1 bg-cohere-primary hover:bg-cohere-primary hover:opacity-90 text-cohere-white rounded-pill"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-cohere-hairline">
        <div className="text-center">
          <div className="text-section-display font-display text-cohere-coral">
            {findings.length}
          </div>
          <p className="text-micro text-cohere-slate">Findings</p>
        </div>
        <div className="text-center">
          <div className="text-section-display font-display text-cohere-green">
            {findings.reduce((sum, f) => sum + f.sources.length, 0)}
          </div>
          <p className="text-micro text-cohere-slate">Sources</p>
        </div>
        <div className="text-center">
          <div className="text-section-display font-display text-cohere-blue">
            {(findings.reduce((sum, f) => sum + f.confidence, 0) / findings.length * 100).toFixed(0)}%
          </div>
          <p className="text-micro text-cohere-slate">Avg Confidence</p>
        </div>
      </div>
    </div>
  );
}
