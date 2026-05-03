"use client";

import { useState } from "react";
import { ResearchDashboard } from "@/components/ResearchDashboard";
import { ResearchFilters, ResearchFilter } from "@/components/ResearchFilters";
import { ResearchTrail, TrailNode } from "@/components/ResearchTrail";
import { SourceNetwork, ResearchSource } from "@/components/SourceNetwork";
import { ResearchReportGenerator, ResearchFinding } from "@/components/ResearchReportGenerator";
import { SemanticCluster, ClusterItem } from "@/components/SemanticCluster";
import { ResearchProvenance, ProvenanceEntry } from "@/components/ResearchProvenance";
import { CollaborativeAnnotations, Annotation } from "@/components/CollaborativeAnnotations";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Network,
  Sparkles,
  Users,
  BookOpen,
  TrendingUp,
} from "lucide-react";

// Mock data
const mockMetrics = [
  {
    label: "Total Findings",
    value: 247,
    icon: <Sparkles className="w-4 h-4" />,
    color: "coral" as const,
    trend: "up" as const,
  },
  {
    label: "Sources Analyzed",
    value: 89,
    icon: <Network className="w-4 h-4" />,
    color: "green" as const,
    trend: "up" as const,
  },
  {
    label: "Average Confidence",
    value: "87%",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "blue" as const,
    trend: "stable" as const,
  },
  {
    label: "Clusters Identified",
    value: 12,
    icon: <BarChart3 className="w-4 h-4" />,
    color: "blue" as const,
  },
];

const mockFilters: ResearchFilter[] = [
  { id: "ai", label: "Artificial Intelligence", type: "topic", color: "coral" },
  { id: "ml", label: "Machine Learning", type: "topic", color: "coral" },
  { id: "nlp", label: "Natural Language Processing", type: "topic", color: "coral" },
  { id: "arxiv", label: "arXiv", type: "source", color: "blue" },
  { id: "github", label: "GitHub", type: "source", color: "blue" },
  { id: "high", label: "High (80-100%)", type: "confidence", color: "green" },
  { id: "medium", label: "Medium (50-80%)", type: "confidence", color: "green" },
  { id: "recent", label: "Last 30 days", type: "date", color: "blue" },
];

const mockTrailNodes: TrailNode[] = [
  {
    id: "1",
    type: "question",
    content: "What are the latest advances in multimodal AI?",
    timestamp: new Date(Date.now() - 3600000),
    confidence: 100,
    sources: 12,
    children: ["2", "3"],
  },
  {
    id: "2",
    type: "finding",
    content: "Vision-language models show significant improvements in zero-shot learning",
    timestamp: new Date(Date.now() - 2700000),
    confidence: 92,
    sources: 8,
  },
  {
    id: "3",
    type: "refinement",
    content: "Cross-modal alignment techniques are critical for performance",
    timestamp: new Date(Date.now() - 1800000),
    confidence: 85,
    sources: 5,
  },
  {
    id: "4",
    type: "synthesis",
    content: "Integration of temporal reasoning with vision-language models opens new research directions",
    timestamp: new Date(Date.now() - 900000),
    confidence: 78,
    sources: 3,
  },
];

const mockSources: ResearchSource[] = [
  {
    id: "s1",
    title: "Attention is All You Need",
    type: "paper",
    confidence: 0.98,
    citations: 1204,
    relatedTo: ["s2", "s3"],
    extractedAt: new Date(Date.now() - 86400000),
    url: "https://arxiv.org/abs/1706.03762",
  },
  {
    id: "s2",
    title: "CLIP: Learning Transferable Models for Computer Vision",
    type: "paper",
    confidence: 0.95,
    citations: 892,
    relatedTo: ["s1", "s4"],
    extractedAt: new Date(Date.now() - 172800000),
    url: "https://openai.com/research/clip",
  },
  {
    id: "s3",
    title: "Multimodal Foundation Models for AI Research",
    type: "report",
    confidence: 0.87,
    citations: 234,
    relatedTo: ["s1", "s2"],
    extractedAt: new Date(Date.now() - 259200000),
  },
];

const mockFindings: ResearchFinding[] = [
  {
    id: "f1",
    title: "Vision-Language Model Performance",
    content:
      "Recent advances in vision-language models show marked improvements in zero-shot learning across diverse benchmarks.",
    sources: ["Attention is All You Need", "CLIP"],
    confidence: 0.92,
    tags: ["vision", "language", "zero-shot"],
    timestamp: new Date(),
  },
  {
    id: "f2",
    title: "Cross-Modal Alignment",
    content:
      "Cross-modal alignment techniques using contrastive learning are essential for bridging visual and textual representations.",
    sources: ["CLIP"],
    confidence: 0.88,
    tags: ["alignment", "contrastive-learning"],
    timestamp: new Date(),
  },
];

const mockClusters: ClusterItem[] = [
  {
    id: "c1",
    title: "Vision-Language Integration",
    summary: "Techniques for aligning visual and textual representations",
    itemCount: 45,
    confidence: 0.92,
    relatedTopics: ["embeddings", "transformers", "attention"],
    color: "coral",
  },
  {
    id: "c2",
    title: "Multimodal Learning",
    summary: "Methods combining multiple modalities in neural networks",
    itemCount: 38,
    confidence: 0.87,
    relatedTopics: ["fusion", "architecture", "benchmarks"],
    color: "blue",
  },
  {
    id: "c3",
    title: "Zero-Shot Learning",
    summary: "Enabling models to recognize unseen classes",
    itemCount: 32,
    confidence: 0.85,
    relatedTopics: ["generalization", "transfer-learning"],
    color: "green",
  },
];

const mockAnnotations: Annotation[] = [
  {
    id: "a1",
    finding: "Vision-language models achieve SOTA on ImageNet",
    context:
      "Recent developments show significant improvements in zero-shot learning",
    author: "Alice Chen",
    timestamp: new Date(),
    color: "coral",
    comments: [
      {
        id: "c1",
        author: "Bob Johnson",
        content: "Great finding! I found similar results in the latest CLIP paper.",
        timestamp: new Date(),
        likes: 3,
      },
    ],
    visibility: "team",
  },
];

export default function ResearchShowcase() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  return (
    <div className="min-h-screen bg-cohere-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-cohere-green to-cohere-navy text-cohere-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <Badge className="bg-cohere-coral text-cohere-white mb-4">
            ✨ Introducing Advanced Research Features
          </Badge>
          <h1 className="text-hero-display font-display mb-4">
            Research Reimagined
          </h1>
          <p className="text-body-large max-w-2xl text-cohere-white opacity-90">
            OTIO now features advanced research organization, collaborative
            annotations, and semantic clustering—all built on the Cohere design
            system for clarity and trust.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-24">
        {/* Dashboard Section */}
        <section>
          <h2 className="text-section-heading font-display text-cohere-ink mb-8">
            Dashboard & Metrics
          </h2>
          <ResearchDashboard metrics={mockMetrics} />
        </section>

        {/* Filters & Sidebar */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-section-heading font-display text-cohere-ink mb-8">
              Filters
            </h2>
            <ResearchFilters
              filters={mockFilters}
              selectedFilters={selectedFilters}
              onFilterToggle={handleFilterToggle}
              onClearAll={() => setSelectedFilters([])}
            />
          </div>

          {/* Trail */}
          <div className="md:col-span-3">
            <h2 className="text-section-heading font-display text-cohere-ink mb-8">
              Research Trail
            </h2>
            <ResearchTrail nodes={mockTrailNodes} />
          </div>
        </section>

        {/* Sources Section */}
        <section>
          <h2 className="text-section-heading font-display text-cohere-ink mb-8">
            Source Network
          </h2>
          <SourceNetwork sources={mockSources} />
        </section>

        {/* Semantic Clustering */}
        <section>
          <h2 className="text-section-heading font-display text-cohere-ink mb-8">
            Semantic Clustering
          </h2>
          <SemanticCluster clusters={mockClusters} />
        </section>

        {/* Provenance */}
        <section>
          <h2 className="text-section-heading font-display text-cohere-ink mb-8">
            Research Provenance
          </h2>
          <ResearchProvenance
            entries={[
              {
                id: "p1",
                claim: "Vision-language models improve zero-shot learning performance",
                source: {
                  title: "Attention is All You Need",
                  author: "Vaswani et al.",
                  type: "paper",
                  url: "https://arxiv.org/abs/1706.03762",
                },
                quotation:
                  "The model relies solely on attention mechanisms to draw global dependencies.",
                pageNumber: 3,
                confidence: 0.98,
                extractedAt: new Date(),
              },
            ]}
          />
        </section>

        {/* Collaborative Annotations */}
        <section>
          <h2 className="text-section-heading font-display text-cohere-ink mb-8">
            Collaborative Annotations
          </h2>
          <CollaborativeAnnotations annotations={mockAnnotations} />
        </section>

        {/* Report Generator */}
        <section>
          <h2 className="text-section-heading font-display text-cohere-ink mb-8">
            Generate Reports
          </h2>
          <ResearchReportGenerator
            findings={mockFindings}
            title="Multimodal AI Research Summary"
          />
        </section>
      </div>

      {/* Footer CTA Section */}
      <div className="bg-gradient-to-r from-cohere-green to-cohere-navy text-cohere-white py-16 mt-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-section-heading font-display mb-4">
            Transform Your Research Workflow
          </h2>
          <p className="text-body-large max-w-2xl mx-auto mb-8 opacity-90">
            Experience a research assistant built on enterprise design principles
            with powerful features for collaborative knowledge synthesis.
          </p>
          <button className="px-8 py-4 bg-cohere-coral hover:bg-cohere-coral hover:opacity-90 text-cohere-white rounded-pill font-button text-button-label transition-all">
            Start Research Session
          </button>
        </div>
      </div>
    </div>
  );
}
