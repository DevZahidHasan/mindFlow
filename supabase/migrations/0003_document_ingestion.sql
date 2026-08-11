-- ==========================================
-- 1. ENUMS & TYPES
-- ==========================================

CREATE TYPE document_source_type AS ENUM ('manual', 'file_upload', 'web_clip');
CREATE TYPE document_processing_status AS ENUM ('draft', 'processing', 'ready', 'failed');

-- ==========================================
-- 2. TABLES DEFINITIONS
-- ==========================================

CREATE TABLE public.knowledge_document_metadata (
  node_id uuid PRIMARY KEY REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
  source_type document_source_type NOT NULL DEFAULT 'manual',
  processing_status document_processing_status NOT NULL DEFAULT 'draft',
  mime_type text,
  word_count integer NOT NULL DEFAULT 0,
  reading_time integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION public.update_document_metadata_updated_at()
RETURNS trigger SECURITY INVOKER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_document_metadata_updated_at_trigger
  BEFORE UPDATE ON public.knowledge_document_metadata
  FOR EACH ROW EXECUTE FUNCTION public.update_document_metadata_updated_at();

-- ==========================================
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.knowledge_document_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow members select document metadata of their workspaces" 
  ON public.knowledge_document_metadata FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.knowledge_nodes kn
      WHERE kn.id = node_id
      AND public.check_is_workspace_member(kn.workspace_id, auth.uid())
    )
  );

CREATE POLICY "Allow members insert document metadata to their workspaces" 
  ON public.knowledge_document_metadata FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.knowledge_nodes kn
      WHERE kn.id = node_id
      AND public.check_is_workspace_member(kn.workspace_id, auth.uid())
    )
  );

CREATE POLICY "Allow members update document metadata of their workspaces" 
  ON public.knowledge_document_metadata FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.knowledge_nodes kn
      WHERE kn.id = node_id
      AND public.check_is_workspace_member(kn.workspace_id, auth.uid())
    )
  );

CREATE POLICY "Allow members delete document metadata of their workspaces" 
  ON public.knowledge_document_metadata FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.knowledge_nodes kn
      WHERE kn.id = node_id
      AND public.check_is_workspace_member(kn.workspace_id, auth.uid())
    )
  );
