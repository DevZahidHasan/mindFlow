-- ==========================================
-- 1. ENUMS & TYPES
-- ==========================================

CREATE TYPE node_status AS ENUM ('active', 'archived');
CREATE TYPE node_type AS ENUM ('note');
CREATE TYPE edge_relationship_type AS ENUM ('related', 'supports', 'contradicts', 'references', 'derived_from');

-- ==========================================
-- 2. TABLES DEFINITIONS
-- ==========================================

-- Knowledge Nodes
CREATE TABLE public.knowledge_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (trim(title) <> ''),
  type node_type NOT NULL DEFAULT 'note',
  content text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  status node_status NOT NULL DEFAULT 'active',
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

-- Knowledge Edges
CREATE TABLE public.knowledge_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
  target_id uuid NOT NULL REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
  relationship_type edge_relationship_type NOT NULL DEFAULT 'related',
  label text,
  weight real NOT NULL DEFAULT 1.0,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT no_self_edges CHECK (source_id <> target_id),
  CONSTRAINT unique_edge UNIQUE (workspace_id, source_id, target_id, relationship_type)
);

-- ==========================================
-- 3. INDEXES
-- ==========================================

-- Node Indexes
CREATE INDEX idx_nodes_workspace_id ON public.knowledge_nodes(workspace_id);
CREATE INDEX idx_nodes_workspace_updated ON public.knowledge_nodes(workspace_id, updated_at);
CREATE INDEX idx_nodes_workspace_status ON public.knowledge_nodes(workspace_id, status);
CREATE INDEX idx_nodes_created_by ON public.knowledge_nodes(created_by);

-- Edge Indexes
CREATE INDEX idx_edges_workspace_id ON public.knowledge_edges(workspace_id);
CREATE INDEX idx_edges_source_id ON public.knowledge_edges(source_id);
CREATE INDEX idx_edges_target_id ON public.knowledge_edges(target_id);
CREATE INDEX idx_edges_workspace_source ON public.knowledge_edges(workspace_id, source_id);
CREATE INDEX idx_edges_workspace_target ON public.knowledge_edges(workspace_id, target_id);

-- ==========================================
-- 4. TRIGGERS
-- ==========================================

-- Auto-update updated_at timestamp for nodes
CREATE OR REPLACE FUNCTION public.update_knowledge_nodes_updated_at()
RETURNS trigger SECURITY INVOKER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_knowledge_nodes_updated_at_trigger
  BEFORE UPDATE ON public.knowledge_nodes
  FOR EACH ROW EXECUTE FUNCTION public.update_knowledge_nodes_updated_at();

-- Auto-set archived_at when status changes to 'archived'
CREATE OR REPLACE FUNCTION public.handle_node_status_change()
RETURNS trigger SECURITY INVOKER AS $$
BEGIN
  IF NEW.status = 'archived' AND OLD.status <> 'archived' THEN
    NEW.archived_at = now();
  ELSIF NEW.status <> 'archived' AND OLD.status = 'archived' THEN
    NEW.archived_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_node_status_change_trigger
  BEFORE UPDATE ON public.knowledge_nodes
  FOR EACH ROW EXECUTE FUNCTION public.handle_node_status_change();


-- ==========================================
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_edges ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- Knowledge Nodes Policies
-- ------------------------------------------

CREATE POLICY "Allow members select nodes of their workspaces" 
  ON public.knowledge_nodes FOR SELECT 
  TO authenticated 
  USING (public.check_is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Allow members insert nodes to their workspaces" 
  ON public.knowledge_nodes FOR INSERT 
  TO authenticated 
  WITH CHECK (public.check_is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Allow members update nodes of their workspaces" 
  ON public.knowledge_nodes FOR UPDATE 
  TO authenticated 
  USING (public.check_is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Allow members delete nodes of their workspaces" 
  ON public.knowledge_nodes FOR DELETE 
  TO authenticated 
  USING (public.check_is_workspace_member(workspace_id, auth.uid()));

-- ------------------------------------------
-- Knowledge Edges Policies
-- ------------------------------------------

CREATE POLICY "Allow members select edges of their workspaces" 
  ON public.knowledge_edges FOR SELECT 
  TO authenticated 
  USING (public.check_is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Allow members insert edges to their workspaces" 
  ON public.knowledge_edges FOR INSERT 
  TO authenticated 
  WITH CHECK (
    public.check_is_workspace_member(workspace_id, auth.uid()) 
  );

CREATE POLICY "Allow members delete edges of their workspaces" 
  ON public.knowledge_edges FOR DELETE 
  TO authenticated 
  USING (public.check_is_workspace_member(workspace_id, auth.uid()));

-- ==========================================
-- 6. CROSS-WORKSPACE INTEGRITY PROTECTION
-- ==========================================

-- Function to ensure an edge's source and target nodes belong to the same workspace as the edge
CREATE OR REPLACE FUNCTION public.check_edge_workspace_integrity()
RETURNS trigger SECURITY DEFINER SET search_path = public AS $$
DECLARE
  source_ws uuid;
  target_ws uuid;
BEGIN
  SELECT workspace_id INTO source_ws FROM public.knowledge_nodes WHERE id = NEW.source_id;
  SELECT workspace_id INTO target_ws FROM public.knowledge_nodes WHERE id = NEW.target_id;
  
  IF source_ws IS NULL OR target_ws IS NULL THEN
    RAISE EXCEPTION 'Source or target node does not exist.';
  END IF;

  IF NEW.workspace_id <> source_ws OR NEW.workspace_id <> target_ws THEN
    RAISE EXCEPTION 'Cross-workspace relationships are strictly prohibited. Edge workspace_id must match source and target workspace_id.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_edge_workspace_integrity_trigger
  BEFORE INSERT OR UPDATE ON public.knowledge_edges
  FOR EACH ROW EXECUTE FUNCTION public.check_edge_workspace_integrity();
