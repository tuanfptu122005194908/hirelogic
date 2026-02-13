# 🔧 HƯỚNG DẪN SETUP CHỨC NĂNG ADMIN RESET PROGRESS

## ⚠️ VẤN ĐỀ

Nếu gặp lỗi "không cho xóa" khi sử dụng chức năng admin reset progress, có thể do:

1. **Database function chưa được tạo** - Migration chưa chạy
2. **RLS (Row Level Security) đang chặn** - Function cần được tạo bởi superuser
3. **Permissions chưa được grant** - Function chưa có quyền execute

## ✅ GIẢI PHÁP

### Cách 1: Chạy Migration (Nếu dùng Supabase CLI)

```bash
supabase migration up
```

### Cách 2: Chạy SQL trực tiếp trong Supabase Dashboard

1. Vào **Supabase Dashboard** > **SQL Editor**
2. Copy và chạy SQL sau:

```sql
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
```

3. Click **Run** để thực thi

### Cách 3: Kiểm tra và Fix Function Owner

Nếu vẫn lỗi, có thể function chưa được tạo bởi superuser. Chạy SQL sau:

```sql
-- Check current owner
SELECT proname, proowner::regrole 
FROM pg_proc 
WHERE proname = 'reset_user_progress';

-- Change owner to postgres (superuser) if needed
ALTER FUNCTION public.reset_user_progress(UUID, TEXT) OWNER TO postgres;
```

## 🧪 TEST FUNCTION

Sau khi setup, test function bằng cách chạy:

```sql
-- Test với một user_id (thay YOUR_USER_ID)
SELECT public.reset_user_progress(
  'YOUR_USER_ID_HERE'::UUID,
  'SE2005'
);
```

Nếu thành công, sẽ trả về:
```json
{
  "success": true,
  "message": "User progress reset successfully",
  "deleted_results": <số>,
  "updated_progress": <số>
}
```

## 🔍 DEBUG

Nếu vẫn lỗi, kiểm tra:

1. **Function có tồn tại không:**
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'reset_user_progress';
   ```

2. **Permissions:**
   ```sql
   SELECT proname, proacl 
   FROM pg_proc 
   WHERE proname = 'reset_user_progress';
   ```

3. **RLS Policies:**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename IN ('challenge_results', 'user_progress');
   ```

4. **Check logs trong Supabase Dashboard > Logs**

## 📝 LƯU Ý

- Function sử dụng `SECURITY DEFINER` để bypass RLS
- Function owner phải là `postgres` hoặc superuser
- Mật khẩu admin: `SE2005`
- Function sẽ xóa tất cả `challenge_results` và reset `user_progress` về 0
