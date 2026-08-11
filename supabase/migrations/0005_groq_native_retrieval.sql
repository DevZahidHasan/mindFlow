-- ==========================================
-- 1. CHUNKS TABLE & FTS SCHEMA
-- ==========================================

CREATE TABLE public.knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id uuid NOT NULL REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  searchable_content tsvector,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Prevent duplicate chunk indices per node
  CONSTRAINT unique_chunk_per_node UNIQUE (node_id, chunk_index)
);

-- Index for workspace isolation performance
CREATE INDEX idx_knowledge_chunks_workspace_id ON public.knowledge_chunks(workspace_id);
CREATE INDEX idx_knowledge_chunks_node_id ON public.knowledge_chunks(node_id);

-- GIN Index for fast full-text search
CREATE INDEX knowledge_chunks_searchable_content_idx ON public.knowledge_chunks USING GIN(searchable_content);

-- ==========================================
-- 2. TRIGGERS
-- ==========================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_knowledge_chunks_updated_at_trigger
  BEFORE UPDATE ON public.knowledge_chunks
  FOR EACH ROW EXECUTE FUNCTION public.update_knowledge_nodes_updated_at();

-- Auto-update searchable_content vector
CREATE OR REPLACE FUNCTION public.update_chunk_searchable_content()
RETURNS trigger SECURITY INVOKER AS $$
BEGIN
  -- We use 'english' configuration for parsing content into tokens
  NEW.searchable_content := to_tsvector('english', NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chunk_searchable_content_trigger
  BEFORE INSERT OR UPDATE OF content ON public.knowledge_chunks
  FOR EACH ROW EXECUTE FUNCTION public.update_chunk_searchable_content();

-- ==========================================
-- 3. ROW-LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow members select chunks of their workspaces" 
  ON public.knowledge_chunks FOR SELECT 
  TO authenticated 
  USING (public.check_is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Allow members insert chunks to their workspaces" 
  ON public.knowledge_chunks FOR INSERT 
  TO authenticated 
  WITH CHECK (public.check_is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Allow members update chunks of their workspaces" 
  ON public.knowledge_chunks FOR UPDATE 
  TO authenticated 
  USING (public.check_is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Allow members delete chunks of their workspaces" 
  ON public.knowledge_chunks FOR DELETE 
  TO authenticated 
  USING (public.check_is_workspace_member(workspace_id, auth.uid()));

-- ==========================================
-- 4. SEARCH RPC FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION public.search_knowledge_chunks(
  query_text text,
  query_workspace_id uuid,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  node_id uuid,
  workspace_id uuid,
  content text,
  chunk_index int,
  similarity real
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  search_query tsquery;
BEGIN
  -- Validate authority strictly
  IF NOT public.check_is_workspace_member(query_workspace_id, auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. You are not a member of this workspace.';
  END IF;

  -- Convert plain text to tsquery
  search_query := websearch_to_tsquery('english', query_text);

  RETURN QUERY
  SELECT
    kc.id,
    kc.node_id,
    kc.workspace_id,
    kc.content,
    kc.chunk_index,
    ts_rank(kc.searchable_content, search_query) AS similarity
  FROM
    public.knowledge_chunks kc
  WHERE
    kc.workspace_id = query_workspace_id
    AND kc.searchable_content @@ search_query
  ORDER BY
    similarity DESC
  LIMIT match_count;
END;
$$;
