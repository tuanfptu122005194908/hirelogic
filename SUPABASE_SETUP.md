# Hướng Dẫn Setup Supabase cho Hệ Thống Chống Gian Lận

## Vấn Đề Hiện Tại

Nếu bạn thấy lỗi 404 khi gọi `log_cheat_violation` hoặc truy vấn `cheat_logs`, có nghĩa là migration chưa được chạy trên Supabase.

## Cách Khắc Phục

### Bước 1: Chạy Migration

1. Mở Supabase Dashboard
2. Vào **SQL Editor**
3. Copy toàn bộ nội dung file `supabase/migrations/20260120000000_create_cheat_logs.sql`
4. Paste vào SQL Editor và chạy

### Bước 2: Kiểm Tra RLS Policies

Sau khi chạy migration, đảm bảo các policies sau đã được tạo:

- `Users can view their own cheat logs` - Users xem vi phạm của mình
- `Users can insert their own cheat logs` - Users insert vi phạm của mình
- `Authenticated users can view all cheat logs` - Xem tất cả vi phạm (cho bảng công khai)
- `Public can view cheat logs` - Public xem vi phạm (cho bảng công khai)

### Bước 3: Kiểm Tra Function

Đảm bảo function `log_cheat_violation` đã được tạo:

```sql
SELECT proname FROM pg_proc WHERE proname = 'log_cheat_violation';
```

Nếu không có kết quả, chạy lại phần CREATE FUNCTION trong migration.

### Bước 4: Kiểm Tra Table

Đảm bảo table `cheat_logs` đã được tạo:

```sql
SELECT * FROM information_schema.tables WHERE table_name = 'cheat_logs';
```

## Nếu Vẫn Lỗi

1. Kiểm tra RLS đã được enable: `ALTER TABLE public.cheat_logs ENABLE ROW LEVEL SECURITY;`
2. Kiểm tra policies có conflict không
3. Kiểm tra user đã authenticated chưa
4. Kiểm tra service role key nếu dùng service role

## Test

Sau khi setup xong, test bằng cách:

1. Vào challenge mode
2. Thoát fullscreen
3. Kiểm tra console không còn lỗi 404
4. Kiểm tra bảng vi phạm có hiển thị không
