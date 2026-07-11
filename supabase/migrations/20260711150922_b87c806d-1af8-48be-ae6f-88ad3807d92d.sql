
-- 1) anime_cache: restrict writes to authenticated
DROP POLICY IF EXISTS "Anyone can create anime cache" ON public.anime_cache;
DROP POLICY IF EXISTS "Anyone can update anime cache" ON public.anime_cache;
CREATE POLICY "Authenticated can create anime cache" ON public.anime_cache
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update anime cache" ON public.anime_cache
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 2) deleted_items: restrict writes to authenticated
DROP POLICY IF EXISTS "Anyone can create deleted items" ON public.deleted_items;
DROP POLICY IF EXISTS "Anyone can delete deleted items" ON public.deleted_items;
CREATE POLICY "Authenticated can create deleted items" ON public.deleted_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete deleted items" ON public.deleted_items
  FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- 3) lists: restrict writes to authenticated
DROP POLICY IF EXISTS "Anyone can create lists" ON public.lists;
DROP POLICY IF EXISTS "Anyone can update lists" ON public.lists;
DROP POLICY IF EXISTS "Anyone can delete lists" ON public.lists;
CREATE POLICY "Authenticated can create lists" ON public.lists
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update lists" ON public.lists
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete lists" ON public.lists
  FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- 4) wheel_items: restrict writes to authenticated
DROP POLICY IF EXISTS "Anyone can create wheel items" ON public.wheel_items;
DROP POLICY IF EXISTS "Anyone can update wheel items" ON public.wheel_items;
DROP POLICY IF EXISTS "Anyone can delete wheel items" ON public.wheel_items;
CREATE POLICY "Authenticated can create wheel items" ON public.wheel_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update wheel items" ON public.wheel_items
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete wheel items" ON public.wheel_items
  FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- 5) participants: only members of a room (or the user's own row) can SELECT
DROP POLICY IF EXISTS "Participants can view room members" ON public.participants;
CREATE POLICY "Members can view room participants" ON public.participants
  FOR SELECT TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.participants p2
      WHERE p2.room_id = participants.room_id AND p2.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = participants.room_id AND r.host_id = auth.uid()
    )
  );

-- 6) Revoke GraphQL/data-api discoverability for tables that shouldn't be publicly enumerated
REVOKE SELECT ON public.anime_cache FROM anon;
REVOKE SELECT ON public.deleted_items FROM anon;
REVOKE SELECT ON public.lists FROM anon;
REVOKE SELECT ON public.wheel_items FROM anon;
REVOKE SELECT ON public.participants FROM anon;
REVOKE SELECT ON public.spins FROM anon;
REVOKE SELECT ON public.entries FROM anon;
REVOKE SELECT ON public.rooms FROM anon;
REVOKE SELECT ON public.wheels FROM anon;
REVOKE SELECT ON public.favorites FROM anon;
REVOKE SELECT ON public.profiles FROM anon;

-- Keep authenticated grants; ensure they exist for tables the app uses.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.anime_cache TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deleted_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wheel_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spins TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wheels TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- 7) Restrict SECURITY DEFINER helper functions from direct invocation
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
