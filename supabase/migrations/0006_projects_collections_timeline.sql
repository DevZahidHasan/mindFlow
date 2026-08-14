-- ==============================================================================
-- PHASE 12 MIGRATION: PROJECTS, COLLECTIONS & KNOWLEDGE LOG (TIMELINE EVENTS)
-- ==============================================================================

-- ==============================================================================
-- 1. ENUMS & TYPES
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('active', 'archived', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE timeline_event_type AS ENUM (
    'NODE_CREATED',
    'NODE_UPDATED',
    'NODE_ARCHIVED',
    'NODE_RESTORED',
    'EDGE_CONNECTED',
    'EDGE_REMOVED',
    'AI_SUMMARIZED',
    'NODE_IMPORTED',
    'NODE_ASSIGNED_PROJECT',
    'NODE_REMOVED_PROJECT',
    'NODE_ASSIGNED_COLLECTION',
    'NODE_REMOVED_COLLECTION'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 2. PROJECTS TABLE & RELATIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (trim(name) <> ''),
  description text,
  color text NOT NULL DEFAULT '#d4af37',
  status project_status NOT NULL DEFAULT 'active',
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_nodes (
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  node_id uuid NOT NULL REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, node_id)
);

-- ==============================================================================
-- 3. COLLECTIONS TABLE & RELATIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (trim(name) <> ''),
  icon text NOT NULL DEFAULT '✦',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collection_nodes (
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  node_id uuid NOT NULL REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, node_id)
);

-- ==============================================================================
-- 4. KNOWLEDGE TIMELINE EVENTS (CHRONOLOGICAL EVENT STREAM)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.knowledge_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  event_type timeline_event_type NOT NULL,
  node_id uuid REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
  secondary_node_id uuid REFERENCES public.knowledge_nodes(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  collection_id uuid REFERENCES public.collections(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 5. SAVED VIEWS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.saved_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (trim(name) <> ''),
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 6. INDEXES FOR HIGH-PERFORMANCE TEMPORAL RETRIEVAL & FILTERING
-- ==============================================================================

-- Projects & Project Nodes
CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON public.projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_project_nodes_workspace ON public.project_nodes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_project_nodes_node ON public.project_nodes(node_id);

-- Collections & Collection Nodes
CREATE INDEX IF NOT EXISTS idx_collections_workspace_id ON public.collections(workspace_id);
CREATE INDEX IF NOT EXISTS idx_collection_nodes_workspace ON public.collection_nodes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_collection_nodes_node ON public.collection_nodes(node_id);

-- Timeline Events
CREATE INDEX IF NOT EXISTS idx_timeline_workspace_created ON public.knowledge_timeline_events(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_workspace_type ON public.knowledge_timeline_events(workspace_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_workspace_node ON public.knowledge_timeline_events(workspace_id, node_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_workspace_project ON public.knowledge_timeline_events(workspace_id, project_id, created_at DESC);

-- Saved Views
CREATE INDEX IF NOT EXISTS idx_saved_views_workspace ON public.saved_views(workspace_id);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_views ENABLE ROW LEVEL SECURITY;

-- Projects RLS
CREATE POLICY "Users can access projects in their workspaces"
  ON public.projects FOR ALL
  USING (check_is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (check_is_workspace_member(workspace_id, auth.uid()));

-- Project Nodes RLS
CREATE POLICY "Users can access project nodes in their workspaces"
  ON public.project_nodes FOR ALL
  USING (check_is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (check_is_workspace_member(workspace_id, auth.uid()));

-- Collections RLS
CREATE POLICY "Users can access collections in their workspaces"
  ON public.collections FOR ALL
  USING (check_is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (check_is_workspace_member(workspace_id, auth.uid()));

-- Collection Nodes RLS
CREATE POLICY "Users can access collection nodes in their workspaces"
  ON public.collection_nodes FOR ALL
  USING (check_is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (check_is_workspace_member(workspace_id, auth.uid()));

-- Timeline Events RLS
CREATE POLICY "Users can view timeline events in their workspaces"
  ON public.knowledge_timeline_events FOR SELECT
  USING (check_is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Users can insert timeline events in their workspaces"
  ON public.knowledge_timeline_events FOR INSERT
  WITH CHECK (check_is_workspace_member(workspace_id, auth.uid()));

-- Saved Views RLS
CREATE POLICY "Users can access saved views in their workspaces"
  ON public.saved_views FOR ALL
  USING (check_is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (check_is_workspace_member(workspace_id, auth.uid()));
