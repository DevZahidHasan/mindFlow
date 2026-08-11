-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge_embeddings table
CREATE TABLE knowledge_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  token_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX ix_knowledge_embeddings_workspace_id ON knowledge_embeddings(workspace_id);
CREATE INDEX ix_knowledge_embeddings_node_id ON knowledge_embeddings(node_id);

-- HNSW index for vector similarity search (using cosine distance)
CREATE INDEX ix_knowledge_embeddings_embedding ON knowledge_embeddings USING hnsw (embedding vector_cosine_ops);

-- Enable RLS
ALTER TABLE knowledge_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their workspace embeddings"
ON knowledge_embeddings
FOR SELECT
USING (check_is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Users can insert their workspace embeddings"
ON knowledge_embeddings
FOR INSERT
WITH CHECK (check_is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Users can update their workspace embeddings"
ON knowledge_embeddings
FOR UPDATE
USING (check_is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Users can delete their workspace embeddings"
ON knowledge_embeddings
FOR DELETE
USING (check_is_workspace_member(workspace_id, auth.uid()));

-- Semantic Search RPC
-- Explicitly enforcing workspace isolation inside the query.
CREATE OR REPLACE FUNCTION match_knowledge_embeddings(
  query_embedding vector(1536),
  query_workspace_id UUID,
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  node_id UUID,
  workspace_id UUID,
  content TEXT,
  similarity FLOAT,
  chunk_index INTEGER
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate authority
  IF NOT check_is_workspace_member(query_workspace_id, auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. You are not a member of this workspace.';
  END IF;

  RETURN QUERY
  SELECT
    ke.id,
    ke.node_id,
    ke.workspace_id,
    ke.content,
    1 - (ke.embedding <=> query_embedding) AS similarity,
    ke.chunk_index
  FROM
    knowledge_embeddings ke
  WHERE
    ke.workspace_id = query_workspace_id
    AND 1 - (ke.embedding <=> query_embedding) > match_threshold
  ORDER BY
    ke.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;
