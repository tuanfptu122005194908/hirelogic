-- Create cheat_logs table to track anti-cheat violations
CREATE TABLE IF NOT EXISTS public.cheat_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  problem_id INTEGER,
  day_number INTEGER,
  violation_type TEXT NOT NULL, -- 'EXIT_FULLSCREEN', 'TAB_SWITCH', 'WINDOW_BLUR', 'EXIT_TO_MAIN'
  violation_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cheat_logs_user_id ON public.cheat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_cheat_logs_day_number ON public.cheat_logs(day_number);
CREATE INDEX IF NOT EXISTS idx_cheat_logs_created_at ON public.cheat_logs(created_at);

-- Enable RLS
ALTER TABLE public.cheat_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own cheat logs
CREATE POLICY "Users can view their own cheat logs"
  ON public.cheat_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own cheat logs
CREATE POLICY "Users can insert their own cheat logs"
  ON public.cheat_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: All authenticated users can view all cheat logs (for public violations board)
CREATE POLICY "Authenticated users can view all cheat logs"
  ON public.cheat_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Anonymous users can also view (for public display)
CREATE POLICY "Public can view cheat logs"
  ON public.cheat_logs
  FOR SELECT
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cheat_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_cheat_logs_updated_at
  BEFORE UPDATE ON public.cheat_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_cheat_logs_updated_at();

-- Function to get or create cheat log and increment count
CREATE OR REPLACE FUNCTION public.log_cheat_violation(
  p_user_id UUID,
  p_problem_id INTEGER DEFAULT NULL,
  p_day_number INTEGER DEFAULT NULL,
  p_violation_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
  v_violation_count INTEGER;
  v_total_violations INTEGER;
BEGIN
  -- Find existing log for this user, problem/day, and violation type today
  SELECT id, violation_count INTO v_log_id, v_violation_count
  FROM public.cheat_logs
  WHERE user_id = p_user_id
    AND (p_problem_id IS NULL OR problem_id = p_problem_id)
    AND (p_day_number IS NULL OR day_number = p_day_number)
    AND violation_type = p_violation_type
    AND DATE(created_at) = CURRENT_DATE
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_log_id IS NULL THEN
    -- Create new log entry
    INSERT INTO public.cheat_logs (
      user_id,
      problem_id,
      day_number,
      violation_type,
violation_count
    ) VALUES (
      p_user_id,
      p_problem_id,
      p_day_number,
      p_violation_type,
      1
    ) RETURNING id INTO v_log_id;
    v_violation_count := 1;
  ELSE
    -- Update existing log
    UPDATE public.cheat_logs
    SET violation_count = violation_count + 1,
        updated_at = now()
    WHERE id = v_log_id
    RETURNING violation_count INTO v_violation_count;
  END IF;

  -- Get total violations for this user today
  SELECT COALESCE(SUM(violation_count), 0) INTO v_total_violations
  FROM public.cheat_logs
  WHERE user_id = p_user_id
    AND DATE(created_at) = CURRENT_DATE;

  RETURN jsonb_build_object(
    'success', true,
    'log_id', v_log_id,
    'violation_count', v_violation_count,
    'total_violations_today', v_total_violations
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.log_cheat_violation(UUID, INTEGER, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_cheat_violation(UUID, INTEGER, INTEGER, TEXT) TO anon;