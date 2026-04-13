
-- ============================================
-- FIX 1: Secure ai_tool_ratings_aggregate view
-- ============================================
-- Note: ai_tool_ratings_aggregate is a VIEW, not a table.
-- We need to ensure security_invoker is set so RLS on underlying tables applies.
-- We also add an RLS policy approach: since views inherit from base tables,
-- we ensure the view is created with security_invoker = true.

-- First, let's check: the ai_tool_ratings table already has RLS with owner-only SELECT.
-- For the aggregate view to be publicly useful (showing average ratings on tools),
-- we need to allow authenticated users to read individual ratings.
-- But the aggregate is a view - we recreate it with security_invoker = on.

-- Drop and recreate the view with security_invoker = on
DROP VIEW IF EXISTS public.ai_tool_ratings_aggregate;

CREATE VIEW public.ai_tool_ratings_aggregate
WITH (security_invoker = on)
AS
SELECT 
  tool_id,
  COUNT(*) FILTER (WHERE rating > 0) AS positive_ratings,
  COUNT(*) FILTER (WHERE rating < 0) AS negative_ratings,
  COALESCE(AVG(rating)::DECIMAL(3,2), 0) AS average_rating,
  COUNT(*) AS total_ratings
FROM public.ai_tool_ratings
GROUP BY tool_id;

-- Now we need to allow authenticated users to read ratings (not just their own)
-- so the aggregate view actually returns data.
-- Drop the overly restrictive SELECT policy on ai_tool_ratings
DROP POLICY IF EXISTS "Users can view their own ratings" ON public.ai_tool_ratings;

-- Allow all authenticated users to view all ratings (public engagement data)
CREATE POLICY "Authenticated users can view all ratings"
ON public.ai_tool_ratings
FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- FIX 2: Open comments for community reading
-- ============================================
-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own comments" ON public.ai_tool_comments;

-- Allow all authenticated users to read all comments (community feature)
CREATE POLICY "Authenticated users can view all comments"
ON public.ai_tool_comments
FOR SELECT
TO authenticated
USING (true);

-- Also update the ai_tool_comments_public view to use security_invoker
DROP VIEW IF EXISTS public.ai_tool_comments_public;

CREATE VIEW public.ai_tool_comments_public
WITH (security_invoker = on)
AS
SELECT
  id,
  tool_id,
  parent_id,
  content,
  likes_count,
  created_at,
  updated_at,
  (user_id = auth.uid()) AS is_own_comment
FROM public.ai_tool_comments;
