# 🚨 QUICK FIX: Lỗi "Could not find the function reset_user_progress"

## ❌ Lỗi hiện tại:
```
POST .../rest/v1/rpc/reset_user_progress 404 (Not Found)
Could not find the function public.reset_user_progress(...) in the schema cache
```

## ✅ Giải pháp nhanh:

### Bước 1: Mở Supabase Dashboard
1. Vào https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **SQL Editor** (menu bên trái)

### Bước 2: Copy và chạy SQL này:

```sql
-- Admin function to reset user progress
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
      user_id, is_active, start_date, current_day,
      consecutive_days, completed_days, last_activity_date,
      daily_challenges, activity_logs
    ) VALUES (
      target_user_id, false, NULL, 0, 0, 0, NULL,
      '[]'::jsonb, '[]'::jsonb
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.reset_user_progress(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_user_progress(UUID, TEXT) TO anon;

-- Set owner to postgres (bypasses RLS)
ALTER FUNCTION public.reset_user_progress(UUID, TEXT) OWNER TO postgres;
```

### Bước 3: Click "Run" hoặc nhấn Ctrl+Enter

### Bước 4: Đợi 5-10 giây để Supabase refresh schema cache

### Bước 5: Thử lại chức năng xóa trong Leaderboard

## ✅ Kiểm tra function đã được tạo:

Chạy SQL này để kiểm tra:

```sql
SELECT 
  proname as function_name,
  proowner::regrole as owner,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'reset_user_progress';
```

Nếu thấy kết quả, function đã được tạo thành công!

## 🔄 Nếu vẫn lỗi:

1. **Refresh trang web** (F5)
2. **Đợi thêm 30 giây** để Supabase sync
3. **Kiểm tra lại trong Supabase Dashboard > Database > Functions** xem function có xuất hiện không
4. **Clear browser cache** và thử lại

## 📝 Lưu ý:

- Function phải được tạo trong schema `public`
- Function owner phải là `postgres` để bypass RLS
- Mật khẩu admin: `SE2005`
