/**
 * Research Analysis Utilities
 * Helper functions for semantic clustering, source analysis, and provenance tracking
 */

import { ClusterItem } from "@/components/SemanticCluster";
import { ResearchSource } from "@/components/SourceNetwork";
import { ProvenanceEntry } from "@/components/ResearchProvenance";

/**
 * Semantic Clustering Simulation
 * In production, this would use vector embeddings and k-means clustering
 */
export function performSemanticClustering(
  texts: string[],
  numClusters: number = 5
): ClusterItem[] {
  // Simulated clustering - in production, use embeddings + k-means
  const colors: ("coral" | "green" | "blue" | "navy")[] = [
    "coral",
    "green",
    "blue",
    "navy",
    "coral",
  ];

  return Array.from({ length: Math.min(numClusters, texts.length) }, (_, i) => ({
    id: `cluster-${i}`,
    title: `Cluster ${i + 1}: Topic Group`,
    summary: `Semantic cluster containing related research findings`,
    itemCount: Math.floor(texts.length / numClusters) + (i === 0 ? texts.length % numClusters : 0),
    confidence: 0.75 + Math.random() * 0.2,
    relatedTopics: generateRelatedTopics(i),
    color: colors[i % colors.length],
  }));
}

function generateRelatedTopics(clusterIndex: number): string[] {
  const topics = [
    ["machine-learning", "deep-learning", "neural-networks"],
    ["nlp", "transformers", "language-models"],
    ["vision", "embeddings", "feature-extraction"],
    ["optimization", "training", "fine-tuning"],
    ["evaluation", "benchmarks", "metrics"],
  ];
  return topics[clusterIndex % topics.length];
}

/**
 * Calculate average confidence from multiple sources
 */
export function calculateAverageConfidence(sources: ResearchSource[]): number {
  if (sources.length === 0) return 0;
  const sum = sources.reduce((acc, source) => acc + source.confidence, 0);
  return sum / sources.length;
}

/**
 * Analyze source network connectivity
 */
export function analyzeSourceNetwork(sources: ResearchSource[]) {
  const networkStats = {
    totalSources: sources.length,
    avgConnections: 0,
    mostConnected: [] as string[],
    isolated: [] as string[],
  };

  const connectionCounts = sources.map((s) => ({
    id: s.id,
    count: s.relatedTo?.length || 0,
  }));

  if (connectionCounts.length > 0) {
    const totalConnections = connectionCounts.reduce((sum, item) => sum + item.count, 0);
    networkStats.avgConnections = totalConnections / connectionCounts.length;

    const maxConnections = Math.max(...connectionCounts.map((c) => c.count));
    networkStats.mostConnected = connectionCounts
      .filter((c) => c.count === maxConnections)
      .map((c) => c.id);

    networkStats.isolated = connectionCounts
      .filter((c) => c.count === 0)
      .map((c) => c.id);
  }

  return networkStats;
}

/**
 * Extract confidence level from text (simulated)
 */
export function extractConfidenceLevel(text: string): number {
  const highConfidenceWords = [
    "definitive",
    "proven",
    "established",
    "conclusive",
    "significant",
  ];
  const lowConfidenceWords = [
    "might",
    "could",
    "possibly",
    "allegedly",
    "uncertain",
  ];

  const textLower = text.toLowerCase();
  const highCount = highConfidenceWords.filter((w) =>
    textLower.includes(w)
  ).length;
  const lowCount = lowConfidenceWords.filter((w) =>
    textLower.includes(w)
  ).length;

  let confidence = 0.5;
  confidence += highCount * 0.1;
  confidence -= lowCount * 0.1;
  return Math.min(Math.max(confidence, 0.1), 0.99);
}

/**
 * Generate provenance from text and source
 */
export function generateProvenance(
  claim: string,
  source: { title: string; url?: string; author?: string; type: string },
  quotation?: string
): Partial<ProvenanceEntry> {
  return {
    claim,
    source: {
      title: source.title,
      url: source.url,
      author: source.author,
      type: (source.type as any) || "article",
    },
    quotation,
    confidence: extractConfidenceLevel(claim),
    extractedAt: new Date(),
  };
}

/**
 * Format sources for citation
 */
export function formatSourceCitation(
  source: ResearchSource,
  format: "apa" | "chicago" | "mla" | "harvard" = "apa"
): string {
  const title = source.title;
  const url = source.url ? ` Retrieved from ${source.url}` : "";

  switch (format) {
    case "apa":
      return `${title}. (${new Date(source.extractedAt).getFullYear()}).${url}`;
    case "chicago":
      return `"${title}." Accessed ${new Date(source.extractedAt).toLocaleDateString()}.${url}`;
    case "mla":
      return `"${title}." ${new Date(source.extractedAt).getFullYear()}.${url}`;
    case "harvard":
      return `${title} (${new Date(source.extractedAt).getFullYear()}).${url}`;
    default:
      return title;
  }
}

/**
 * Identify key topics from text
 */
export function extractTopicsFromText(text: string): string[] {
  // Simulated topic extraction - in production use NLP
  const commonAITopics = [
    "ai",
    "machine-learning",
    "deep-learning",
    "nlp",
    "vision",
    "transformers",
    "embeddings",
    "neural-networks",
    "optimization",
    "fine-tuning",
    "language-models",
    "computer-vision",
    "reinforcement-learning",
    "transfer-learning",
  ];

  const textLower = text.toLowerCase();
  return commonAITopics.filter((topic) =>
    textLower.includes(topic.replace("-", " "))
  );
}

/**
 * Calculate research metrics from findings
 */
export function calculateResearchMetrics(
  findings: { confidence: number; sources: string[] }[],
  sources: ResearchSource[],
  clusters: ClusterItem[]
) {
  return {
    totalFindings: findings.length,
    sourcesAnalyzed: sources.length,
    averageConfidence:
      findings.length > 0
        ? findings.reduce((sum, f) => sum + f.confidence, 0) / findings.length
        : 0,
    clustersIdentified: clusters.length,
    lastUpdated: new Date(),
  };
}

/**
 * Deduplicate sources based on similarity
 */
export function deduplicateSources(sources: ResearchSource[]): ResearchSource[] {
  const seen = new Map<string, ResearchSource>();

  sources.forEach((source) => {
    // Simple deduplication based on title similarity
    const key = source.title.toLowerCase().trim();
    if (!seen.has(key) || (seen.get(key)?.confidence || 0) < source.confidence) {
      seen.set(key, source);
    }
  });

  return Array.from(seen.values());
}

/**
 * Filter findings by criteria
 */
export function filterFindings(
  findings: any[],
  criteria: {
    minConfidence?: number;
    topics?: string[];
    sources?: string[];
    dateRange?: { start: Date; end: Date };
  }
): any[] {
  return findings.filter((finding) => {
    if (
      criteria.minConfidence &&
      finding.confidence < criteria.minConfidence
    ) {
      return false;
    }

    if (
      criteria.topics &&
      criteria.topics.length > 0 &&
      !criteria.topics.some((topic) =>
        finding.tags?.includes(topic)
      )
    ) {
      return false;
    }

    if (
      criteria.sources &&
      criteria.sources.length > 0 &&
      !criteria.sources.some((source) =>
        finding.sources?.includes(source)
      )
    ) {
      return false;
    }

    if (criteria.dateRange) {
      const findingDate = new Date(finding.timestamp);
      if (
        findingDate < criteria.dateRange.start ||
        findingDate > criteria.dateRange.end
      ) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Generate research report summary
 */
export function generateReportSummary(
  findings: any[],
  clusters: ClusterItem[]
): string {
  const totalFindings = findings.length;
  const avgConfidence =
    findings.reduce((sum, f) => sum + f.confidence, 0) / findings.length;
  const totalClusters = clusters.length;

  return `
Research Summary:
- Total Findings: ${totalFindings}
- Average Confidence: ${(avgConfidence * 100).toFixed(1)}%
- Topics Identified: ${totalClusters}
- Generated: ${new Date().toLocaleDateString()}
`;
}
