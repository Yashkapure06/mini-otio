import { create } from "zustand";
import { ResearchSource } from "@/components/SourceNetwork";
import { ClusterItem } from "@/components/SemanticCluster";
import { Annotation } from "@/components/CollaborativeAnnotations";
import { ProvenanceEntry } from "@/components/ResearchProvenance";
import { TrailNode } from "@/components/ResearchTrail";
import { ResearchFilter } from "@/components/ResearchFilters";

export interface ResearchMetrics {
  totalFindings: number;
  sourcesAnalyzed: number;
  averageConfidence: number;
  clustersIdentified: number;
  lastUpdated: Date;
}

interface ResearchState {
  // Metrics
  metrics: ResearchMetrics;
  updateMetrics: (metrics: ResearchMetrics) => void;

  // Filters
  activeFilters: string[];
  addFilter: (filterId: string) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;

  // Trail
  trailNodes: TrailNode[];
  addTrailNode: (node: TrailNode) => void;
  updateTrailNode: (nodeId: string, node: Partial<TrailNode>) => void;

  // Sources
  sources: ResearchSource[];
  addSource: (source: ResearchSource) => void;
  updateSource: (sourceId: string, source: Partial<ResearchSource>) => void;
  removeSources: (sourceIds: string[]) => void;

  // Clusters
  clusters: ClusterItem[];
  addCluster: (cluster: ClusterItem) => void;
  updateCluster: (clusterId: string, cluster: Partial<ClusterItem>) => void;

  // Provenance
  provenanceEntries: ProvenanceEntry[];
  addProvenanceEntry: (entry: ProvenanceEntry) => void;

  // Annotations
  annotations: Annotation[];
  addAnnotation: (annotation: Annotation) => void;
  addComment: (annotationId: string, comment: any) => void;
  removeAnnotation: (annotationId: string) => void;

  // Reset
  resetResearchState: () => void;
}

const initialMetrics: ResearchMetrics = {
  totalFindings: 0,
  sourcesAnalyzed: 0,
  averageConfidence: 0,
  clustersIdentified: 0,
  lastUpdated: new Date(),
};

export const useResearchStore = create<ResearchState>((set) => ({
  // Metrics
  metrics: initialMetrics,
  updateMetrics: (metrics) => set({ metrics }),

  // Filters
  activeFilters: [],
  addFilter: (filterId) =>
    set((state) => ({
      activeFilters: [...state.activeFilters, filterId],
    })),
  removeFilter: (filterId) =>
    set((state) => ({
      activeFilters: state.activeFilters.filter((id) => id !== filterId),
    })),
  clearFilters: () => set({ activeFilters: [] }),

  // Trail
  trailNodes: [],
  addTrailNode: (node) =>
    set((state) => ({
      trailNodes: [...state.trailNodes, node],
    })),
  updateTrailNode: (nodeId, updates) =>
    set((state) => ({
      trailNodes: state.trailNodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      ),
    })),

  // Sources
  sources: [],
  addSource: (source) =>
    set((state) => ({
      sources: [...state.sources, source],
    })),
  updateSource: (sourceId, updates) =>
    set((state) => ({
      sources: state.sources.map((source) =>
        source.id === sourceId ? { ...source, ...updates } : source
      ),
    })),
  removeSources: (sourceIds) =>
    set((state) => ({
      sources: state.sources.filter((s) => !sourceIds.includes(s.id)),
    })),

  // Clusters
  clusters: [],
  addCluster: (cluster) =>
    set((state) => ({
      clusters: [...state.clusters, cluster],
    })),
  updateCluster: (clusterId, updates) =>
    set((state) => ({
      clusters: state.clusters.map((cluster) =>
        cluster.id === clusterId ? { ...cluster, ...updates } : cluster
      ),
    })),

  // Provenance
  provenanceEntries: [],
  addProvenanceEntry: (entry) =>
    set((state) => ({
      provenanceEntries: [...state.provenanceEntries, entry],
    })),

  // Annotations
  annotations: [],
  addAnnotation: (annotation) =>
    set((state) => ({
      annotations: [...state.annotations, annotation],
    })),
  addComment: (annotationId, comment) =>
    set((state) => ({
      annotations: state.annotations.map((annotation) =>
        annotation.id === annotationId
          ? {
              ...annotation,
              comments: [...annotation.comments, comment],
            }
          : annotation
      ),
    })),
  removeAnnotation: (annotationId) =>
    set((state) => ({
      annotations: state.annotations.filter((a) => a.id !== annotationId),
    })),

  // Reset
  resetResearchState: () =>
    set({
      metrics: initialMetrics,
      activeFilters: [],
      trailNodes: [],
      sources: [],
      clusters: [],
      provenanceEntries: [],
      annotations: [],
    }),
}));
