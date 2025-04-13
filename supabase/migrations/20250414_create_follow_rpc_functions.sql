
-- Create function to follow a story
CREATE OR REPLACE FUNCTION public.follow_story(follower_id_param UUID, story_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  INSERT INTO public.story_follows (follower_id, story_id)
  VALUES (follower_id_param, story_id_param)
  ON CONFLICT (follower_id, story_id) DO NOTHING;
END;
$$;

-- Create function to unfollow a story
CREATE OR REPLACE FUNCTION public.unfollow_story(follower_id_param UUID, story_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  DELETE FROM public.story_follows
  WHERE follower_id = follower_id_param
  AND story_id = story_id_param;
END;
$$;
