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
}
