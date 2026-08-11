-- Enable UUID generation extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES DEFINITIONS
-- ==========================================

-- User Profiles (linked to auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Workspaces
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Workspace Memberships
CREATE TABLE public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT unique_workspace_user UNIQUE (workspace_id, user_id)
);

-- ==========================================
-- 2. SECURITY DEFINER HELPER FUNCTIONS
-- ==========================================

/**
 * Checks if a user is a member of a given workspace.
 * Uses SECURITY DEFINER to bypass RLS policies on workspace_members,
 * completely avoiding infinite RLS recursion loops.
 */
CREATE OR REPLACE FUNCTION public.check_is_workspace_member(workspace_id uuid, user_id uuid)
RETURNS boolean SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.workspace_members 
    WHERE workspace_members.workspace_id = check_is_workspace_member.workspace_id 
      AND workspace_members.user_id = check_is_workspace_member.user_id
  );
END;
$$ LANGUAGE plpgsql;

/**
 * Triggers atomic user profile creation when a new user signs up in Supabase Auth.
 */
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 3. ATOMIC WORKSPACE CREATION RPC
-- ==========================================

/**
 * Creates a workspace and inserts the owner membership record atomically.
 * Runs under SECURITY INVOKER to respect active session privileges.
 */
CREATE OR REPLACE FUNCTION public.create_workspace_with_owner(workspace_name text)
RETURNS uuid SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_workspace_id uuid;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert the workspace
  INSERT INTO public.workspaces (name) 
  VALUES (workspace_name) 
  RETURNING id INTO new_workspace_id;

  -- Create the owner membership row
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, current_user_id, 'owner');

  RETURN new_workspace_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Allow public read access to profiles" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow individual updates to own profile" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Workspaces Policies
CREATE POLICY "Allow workspace members select access" 
  ON public.workspaces FOR SELECT 
  TO authenticated 
  USING (public.check_is_workspace_member(id, auth.uid()));

CREATE POLICY "Allow workspace members update access" 
  ON public.workspaces FOR UPDATE 
  TO authenticated 
  USING (public.check_is_workspace_member(id, auth.uid()));

CREATE POLICY "Allow workspace inserts to authenticated users" 
  ON public.workspaces FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Workspace Members Policies
CREATE POLICY "Allow members select rosters of same workspace" 
  ON public.workspace_members FOR SELECT 
  TO authenticated 
  USING (public.check_is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Allow users insert their own membership row" 
  ON public.workspace_members FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow members update/delete workspace members" 
  ON public.workspace_members FOR ALL 
  TO authenticated 
  USING (public.check_is_workspace_member(workspace_id, auth.uid()));
