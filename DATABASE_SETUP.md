# Cấu Hình Database Supabase

## Vấn đề hiện tại

Admin dashboard hiển thị "Chưa có dữ liệu người dùng" vì:

1. Bảng `profiles` chưa được tạo
2. Không có trigger để tự động tạo profile khi user đăng ký
3. Chưa có user admin

## Hướng dẫn setup

### 1. Chạy Schema Database

1. Mở [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào **SQL Editor**
4. Copy toàn bộ nội dung file `supabase-schema.sql`
5. Paste và chạy script

### 2. Tạo User Admin

Sau khi chạy schema, tạo user admin bằng 1 trong 2 cách:

**Cách 1: Đăng ký tài khoản admin**

- Truy cập `/register`
- Đăng ký với email: `admin@example.com`, password: `admin123`
- Sau đó chạy SQL để set role admin:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
```

**Cách 2: Tạo trực tiếp trong SQL Editor**

```sql
-- Chạy script này trong SQL Editor
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"username": "admin"}'::jsonb
);

-- Lấy ID vừa tạo và tạo profile
INSERT INTO profiles (id, email, username, role)
SELECT id, email, 'admin', 'admin'
FROM auth.users
WHERE email = 'admin@example.com';
```

### 3. Test

1. Đăng nhập với tài khoản admin
2. Truy cập `/admin`
3. Click vào "👥 Quản Lý User"
4. Bây giờ sẽ hiển thị danh sách users

## Cấu trúc Database

### Bảng chính:

- `profiles`: Thông tin user từ Supabase Auth
- `custom_users`: Users được thêm thủ công bởi admin
- `custom_mangas`: Truyện được quản lý bởi admin
- `custom_chapters`: Chapters của truyện custom

### Trigger:

- `handle_new_user()`: Tự động tạo profile khi user đăng ký

### RLS Policies:

- Users chỉ xem được profile của mình
- Admin có toàn quyền truy cập tất cả bảng</content>
  <parameter name="filePath">c:\Users\thanh\DATN\my-manga-app\DATABASE_SETUP.md
