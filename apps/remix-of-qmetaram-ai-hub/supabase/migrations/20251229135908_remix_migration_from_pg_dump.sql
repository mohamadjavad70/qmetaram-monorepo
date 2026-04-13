CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: update_tool_average_rating(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_tool_average_rating() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.ai_tools 
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0) 
      FROM public.ai_tool_ratings 
      WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM public.ai_tool_ratings 
      WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.tool_id, OLD.tool_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: update_tool_comments_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_tool_comments_count() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.ai_tools 
  SET 
    comments_count = (
      SELECT COUNT(*) 
      FROM public.ai_tool_comments 
      WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.tool_id, OLD.tool_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: ai_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    project_type text DEFAULT 'general'::text NOT NULL,
    code_content text,
    file_url text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid
);


--
-- Name: ai_tool_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_tool_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tool_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    parent_id uuid,
    likes_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_tool_comments_public; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.ai_tool_comments_public WITH (security_invoker='on') AS
 SELECT id,
    tool_id,
    content,
    parent_id,
    likes_count,
    created_at,
    updated_at,
    (auth.uid() = user_id) AS is_own_comment
   FROM public.ai_tool_comments;


--
-- Name: ai_tool_favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_tool_favorites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tool_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_tool_ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_tool_ratings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tool_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_tool_ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: ai_tool_ratings_aggregate; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.ai_tool_ratings_aggregate WITH (security_invoker='on') AS
 SELECT tool_id,
    count(*) FILTER (WHERE (rating >= 4)) AS positive_ratings,
    count(*) FILTER (WHERE (rating < 4)) AS negative_ratings,
    (avg(rating))::numeric(3,2) AS average_rating,
    count(*) AS total_ratings
   FROM public.ai_tool_ratings
  GROUP BY tool_id;


--
-- Name: ai_tool_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_tool_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tool_id uuid NOT NULL,
    user_id uuid NOT NULL,
    session_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_tools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_tools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    huggingface_url text,
    category text NOT NULL,
    subcategory text,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    average_rating numeric(3,2) DEFAULT 0,
    total_ratings integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    is_trending boolean DEFAULT false,
    icon text,
    author text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chat_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    title text DEFAULT 'New Chat'::text NOT NULL,
    module_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    module text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chat_messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text])))
);


--
-- Name: custom_ai_models; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_ai_models (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    model_config jsonb DEFAULT '{}'::jsonb,
    performance_metrics jsonb DEFAULT '{}'::jsonb,
    training_data jsonb DEFAULT '{}'::jsonb,
    version text DEFAULT '1.0.0'::text,
    status text DEFAULT 'draft'::text,
    is_private boolean DEFAULT true,
    api_endpoint text,
    last_trained_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custom_ai_models_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'training'::text, 'active'::text, 'archived'::text])))
);


--
-- Name: project_evaluations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_evaluations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    overall_score integer NOT NULL,
    code_quality_score integer,
    architecture_score integer,
    performance_score integer,
    security_score integer,
    summary text NOT NULL,
    strengths jsonb DEFAULT '[]'::jsonb,
    improvements jsonb DEFAULT '[]'::jsonb,
    recommendations jsonb DEFAULT '[]'::jsonb,
    detailed_analysis text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT project_evaluations_architecture_score_check CHECK (((architecture_score >= 0) AND (architecture_score <= 100))),
    CONSTRAINT project_evaluations_code_quality_score_check CHECK (((code_quality_score >= 0) AND (code_quality_score <= 100))),
    CONSTRAINT project_evaluations_overall_score_check CHECK (((overall_score >= 0) AND (overall_score <= 100))),
    CONSTRAINT project_evaluations_performance_score_check CHECK (((performance_score >= 0) AND (performance_score <= 100))),
    CONSTRAINT project_evaluations_security_score_check CHECK (((security_score >= 0) AND (security_score <= 100)))
);


--
-- Name: ai_projects ai_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_projects
    ADD CONSTRAINT ai_projects_pkey PRIMARY KEY (id);


--
-- Name: ai_tool_comments ai_tool_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tool_comments
    ADD CONSTRAINT ai_tool_comments_pkey PRIMARY KEY (id);


--
-- Name: ai_tool_favorites ai_tool_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tool_favorites
    ADD CONSTRAINT ai_tool_favorites_pkey PRIMARY KEY (id);


--
-- Name: ai_tool_favorites ai_tool_favorites_tool_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tool_favorites
    ADD CONSTRAINT ai_tool_favorites_tool_id_user_id_key UNIQUE (tool_id, user_id);


--
-- Name: ai_tool_ratings ai_tool_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tool_ratings
    ADD CONSTRAINT ai_tool_ratings_pkey PRIMARY KEY (id);


--
-- Name: ai_tool_ratings ai_tool_ratings_tool_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tool_ratings
    ADD CONSTRAINT ai_tool_ratings_tool_id_user_id_key UNIQUE (tool_id, user_id);


--
-- Name: ai_tool_usage ai_tool_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tool_usage
    ADD CONSTRAINT ai_tool_usage_pkey PRIMARY KEY (id);


--
-- Name: ai_tools ai_tools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tools
    ADD CONSTRAINT ai_tools_pkey PRIMARY KEY (id);


--
-- Name: ai_tools ai_tools_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tools
    ADD CONSTRAINT ai_tools_slug_key UNIQUE (slug);


--
-- Name: chat_conversations chat_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: custom_ai_models custom_ai_models_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_ai_models
    ADD CONSTRAINT custom_ai_models_pkey PRIMARY KEY (id);


--
-- Name: project_evaluations project_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_evaluations
    ADD CONSTRAINT project_evaluations_pkey PRIMARY KEY (id);


--
-- Name: idx_ai_tool_comments_tool; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_tool_comments_tool ON public.ai_tool_comments USING btree (tool_id);


--
-- Name: idx_ai_tool_favorites_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_tool_favorites_user ON public.ai_tool_favorites USING btree (user_id);


--
-- Name: idx_ai_tool_ratings_tool; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_tool_ratings_tool ON public.ai_tool_ratings USING btree (tool_id);


--
-- Name: idx_ai_tool_usage_tool; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_tool_usage_tool ON public.ai_tool_usage USING btree (tool_id);


--
-- Name: idx_ai_tools_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_tools_category ON public.ai_tools USING btree (category);


--
-- Name: idx_ai_tools_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_tools_featured ON public.ai_tools USING btree (is_featured) WHERE (is_featured = true);


--
-- Name: idx_ai_tools_trending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_tools_trending ON public.ai_tools USING btree (is_trending) WHERE (is_trending = true);


--
-- Name: idx_chat_conversations_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_conversations_updated_at ON public.chat_conversations USING btree (updated_at DESC);


--
-- Name: idx_chat_messages_conversation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages USING btree (conversation_id);


--
-- Name: idx_custom_ai_models_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_ai_models_owner ON public.custom_ai_models USING btree (owner_id);


--
-- Name: idx_custom_ai_models_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_ai_models_status ON public.custom_ai_models USING btree (status);


--
-- Name: ai_projects update_ai_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_projects_updated_at BEFORE UPDATE ON public.ai_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: chat_conversations update_chat_conversations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_tool_comments update_comments_count_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_comments_count_trigger AFTER INSERT OR DELETE ON public.ai_tool_comments FOR EACH ROW EXECUTE FUNCTION public.update_tool_comments_count();


--
-- Name: custom_ai_models update_custom_ai_models_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_custom_ai_models_updated_at BEFORE UPDATE ON public.custom_ai_models FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_tool_ratings update_rating_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_rating_trigger AFTER INSERT OR DELETE OR UPDATE ON public.ai_tool_ratings FOR EACH ROW EXECUTE FUNCTION public.update_tool_average_rating();


--
-- Name: ai_projects ai_projects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_projects
    ADD CONSTRAINT ai_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ai_tool_comments ai_tool_comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tool_comments
    ADD CONSTRAINT ai_tool_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.ai_tool_comments(id) ON DELETE CASCADE;


--
-- Name: ai_tool_comments ai_tool_comments_tool_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tool_comments
    ADD CONSTRAINT ai_tool_comments_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.ai_tools(id) ON DELETE CASCADE;


--
-- Name: ai_tool_comments ai_tool_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tool_comments
    ADD CONSTRAINT ai_tool_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ai_tool_favorites ai_tool_favorites_tool_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tool_favorites
    ADD CONSTRAINT ai_tool_favorites_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.ai_tools(id) ON DELETE CASCADE;


--
-- Name: ai_tool_favorites ai_tool_favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tool_favorites
    ADD CONSTRAINT ai_tool_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ai_tool_ratings ai_tool_ratings_tool_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tool_ratings
    ADD CONSTRAINT ai_tool_ratings_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.ai_tools(id) ON DELETE CASCADE;


--
-- Name: ai_tool_ratings ai_tool_ratings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tool_ratings
    ADD CONSTRAINT ai_tool_ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ai_tool_usage ai_tool_usage_tool_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tool_usage
    ADD CONSTRAINT ai_tool_usage_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.ai_tools(id) ON DELETE CASCADE;


--
-- Name: ai_tool_usage ai_tool_usage_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tool_usage
    ADD CONSTRAINT ai_tool_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id) ON DELETE CASCADE;


--
-- Name: project_evaluations project_evaluations_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_evaluations
    ADD CONSTRAINT project_evaluations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.ai_projects(id) ON DELETE CASCADE;


--
-- Name: ai_tools Anyone can view AI tools; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view AI tools" ON public.ai_tools FOR SELECT USING (true);


--
-- Name: ai_tool_favorites Authenticated users can add favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can add favorites" ON public.ai_tool_favorites FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_tool_comments Authenticated users can create comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create comments" ON public.ai_tool_comments FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_tool_ratings Authenticated users can create ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create ratings" ON public.ai_tool_ratings FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_tool_usage Authenticated users can log their own usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can log their own usage" ON public.ai_tool_usage FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: custom_ai_models Owners can create their own models; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can create their own models" ON public.custom_ai_models FOR INSERT WITH CHECK ((auth.uid() = owner_id));


--
-- Name: custom_ai_models Owners can delete their own models; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can delete their own models" ON public.custom_ai_models FOR DELETE USING ((auth.uid() = owner_id));


--
-- Name: custom_ai_models Owners can update their own models; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can update their own models" ON public.custom_ai_models FOR UPDATE USING ((auth.uid() = owner_id));


--
-- Name: custom_ai_models Owners can view their own models; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can view their own models" ON public.custom_ai_models FOR SELECT USING ((auth.uid() = owner_id));


--
-- Name: project_evaluations Users can create evaluations for their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create evaluations for their projects" ON public.project_evaluations FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.ai_projects
  WHERE ((ai_projects.id = project_evaluations.project_id) AND (ai_projects.user_id = auth.uid())))));


--
-- Name: chat_messages Users can create messages in their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create messages in their conversations" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.chat_conversations
  WHERE ((chat_conversations.id = chat_messages.conversation_id) AND (chat_conversations.user_id = auth.uid())))));


--
-- Name: chat_conversations Users can create their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own conversations" ON public.chat_conversations FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_projects Users can create their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own projects" ON public.ai_projects FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: chat_messages Users can delete messages in their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete messages in their conversations" ON public.chat_messages FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.chat_conversations
  WHERE ((chat_conversations.id = chat_messages.conversation_id) AND (chat_conversations.user_id = auth.uid())))));


--
-- Name: ai_tool_comments Users can delete their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own comments" ON public.ai_tool_comments FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: chat_conversations Users can delete their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own conversations" ON public.chat_conversations FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: ai_projects Users can delete their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own projects" ON public.ai_projects FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: ai_tool_ratings Users can delete their own ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own ratings" ON public.ai_tool_ratings FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: ai_tool_favorites Users can remove their own favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can remove their own favorites" ON public.ai_tool_favorites FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: ai_tool_comments Users can update their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own comments" ON public.ai_tool_comments FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: chat_conversations Users can update their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own conversations" ON public.chat_conversations FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: ai_projects Users can update their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own projects" ON public.ai_projects FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: ai_tool_ratings Users can update their own ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own ratings" ON public.ai_tool_ratings FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: project_evaluations Users can view evaluations for their projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view evaluations for their projects" ON public.project_evaluations FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.ai_projects
  WHERE ((ai_projects.id = project_evaluations.project_id) AND (ai_projects.user_id = auth.uid())))));


--
-- Name: chat_messages Users can view messages in their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages in their conversations" ON public.chat_messages FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.chat_conversations
  WHERE ((chat_conversations.id = chat_messages.conversation_id) AND (chat_conversations.user_id = auth.uid())))));


--
-- Name: ai_tool_comments Users can view their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own comments" ON public.ai_tool_comments FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: chat_conversations Users can view their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own conversations" ON public.chat_conversations FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: ai_tool_favorites Users can view their own favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own favorites" ON public.ai_tool_favorites FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: ai_projects Users can view their own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own projects" ON public.ai_projects FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: ai_tool_ratings Users can view their own ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own ratings" ON public.ai_tool_ratings FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: ai_tool_usage Users can view their own usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own usage" ON public.ai_tool_usage FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ai_projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_projects ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_tool_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_tool_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_tool_favorites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_tool_favorites ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_tool_ratings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_tool_ratings ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_tool_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_tool_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_tools; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: custom_ai_models; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.custom_ai_models ENABLE ROW LEVEL SECURITY;

--
-- Name: project_evaluations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.project_evaluations ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;