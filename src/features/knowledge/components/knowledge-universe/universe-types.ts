import { KnowledgeNode } from "@/features/knowledge/schemas/node.schema";
import { KnowledgeEdge } from "@/features/knowledge/schemas/edge.schema";
import * as THREE from "three";

export interface GraphNode extends KnowledgeNode {
  // d3-force coordinates
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  
  // physics states
  targetPosition?: THREE.Vector3;
  color?: THREE.Color;
  scale?: number;
  isSelected?: boolean;
}

export interface GraphEdge extends KnowledgeEdge {
  sourceNode?: GraphNode;
  targetNode?: GraphNode;
  source?: any;
  target?: any;
}

export interface UniverseProps {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  workspaceId: string;
  focusedNodeId?: string;
}
