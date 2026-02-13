-- ============================================
-- SETUP ADMIN RESET PROGRESS FUNCTION
-- Copy và chạy SQL này trong Supabase Dashboard > SQL Editor
-- ============================================

-- Admin function to reset user progress
-- This function bypasses RLS to allow admin operations
CREATE OR REPLACE FUNCTION public.reset_user_progress(
  target_user_id UUID,
  admin_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  deleted_count INTEGER;
  updated_count INTEGER;
BEGIN
  -- Check admin password
  IF admin_password != 'SE2005' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid admin password'
    );
  END IF;

  -- Delete all challenge results for the user
  -- SECURITY DEFINER runs as function owner (should be postgres/superuser)
  -- which bypasses RLS automatically
  DELETE FROM public.challenge_results
  WHERE user_id = target_user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Reset user_progress to default values
  UPDATE public.user_progress
  SET
    is_active = false,
    start_date = NULL,
    current_day = 0,
    consecutive_days = 0,
    completed_days = 0,
    last_activity_date = NULL,
    daily_challenges = '[]'::jsonb,
    activity_logs = '[]'::jsonb,
    updated_at = now()
  WHERE user_id = target_user_id;
  GET DIAGNOSTICS updated_count = ROW_COUNT;

  -- If no progress record exists, create one with default values
  IF updated_count = 0 THEN
    INSERT INTO public.user_progress (
      user_id,
      is_active,
      start_date,
      current_day,
      consecutive_days,
      completed_days,
      last_activity_date,
      daily_challenges,
      activity_logs
    ) VALUES (
      target_user_id,
      false,
      NULL,
      0,
      0,
      0,
      NULL,
      '[]'::jsonb,
      '[]'::jsonb
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User progress reset successfully',
    'deleted_results', deleted_count,
    'updated_progress', updated_count
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
-- (The password check provides the actual security)
GRANT EXECUTE ON FUNCTION public.reset_user_progress(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_user_progress(UUID, TEXT) TO anon;

-- Ensure function is owned by postgres (superuser) to bypass RLS
ALTER FUNCTION public.reset_user_progress(UUID, TEXT) OWNER TO postgres;

-- ============================================
-- TEST FUNCTION (Optional - comment out after testing)
-- ============================================
-- SELECT public.reset_user_progress(
--   'YOUR_USER_ID_HERE'::UUID,
--   'SE2005'
-- );
