
DROP POLICY "public can submit requests" ON public.fab_requests;
CREATE POLICY "public can submit requests" ON public.fab_requests
  FOR INSERT WITH CHECK (city IS NOT NULL AND length(city) > 0);

DROP POLICY "users update own profile" ON public.maker_profiles;
CREATE POLICY "users update own profile" ON public.maker_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY "requester updates own" ON public.fab_requests;
CREATE POLICY "requester updates own" ON public.fab_requests
  FOR UPDATE USING (auth.uid() = requester_id) WITH CHECK (auth.uid() = requester_id);
