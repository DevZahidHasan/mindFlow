export interface LLMRequest {
  systemPrompt: string;
  userQuery: string;
  context: string;
}

export interface Citation {
  nodeId: string;
  title: string;
  excerpt: string;
  relevance?: number;
}

export interface RAGResponse {
  answer: string;
  citations: Citation[];
}

export interface RetrievedKnowledge {
  nodeId: string;
  chunkId: string;
  content: string;
  score: number;
}

export interface SemanticConnection {
  targetNodeId: string;
  title: string;
  similarity: number;
  explanation?: string;
  isConnected?: boolean;
}

export type CommandIntentType =
  | "SEARCH"
  | "CONVERSATION"
  | "CREATE_NODE"
  | "CONNECT_NODES"
  | "SYNTHESIZE";

export interface CreateNodeProposal {
  type: "CREATE_NODE";
  title: string;
  content: string;
  rationale: string;
}

export interface ConnectNodesProposal {
  type: "CONNECT_NODES";
  sourceNodeId: string;
  sourceTitle: string;
  targetNodeId: string;
  targetTitle: string;
  relationshipType: string;
  label: string;
  rationale: string;
}

export interface MultiConnectNodesProposal {
  type: "MULTI_CONNECT_NODES";
  connections: {
    sourceNodeId: string;
    sourceTitle: string;
    targetNodeId: string;
    targetTitle: string;
    label: string;
  }[];
  rationale: string;
}

export type ProposedCommandAction = CreateNodeProposal | ConnectNodesProposal | MultiConnectNodesProposal;

export interface AmbiguousNodeCandidate {
  id: string;
  title: string;
  type: string;
  similarity?: number;
}

export interface CommandIntentResult {
  intent: CommandIntentType;
  confidence: number;
  rationale: string;
  answer?: string;
  citations?: Citation[];
  proposedAction?: ProposedCommandAction;
  ambiguousCandidates?: {
    slot: "source" | "target";
    query: string;
    candidates: AmbiguousNodeCandidate[];
  };
}

