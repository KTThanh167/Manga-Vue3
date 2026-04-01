-- Tạo bảng profiles cho user authentication
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng custom_users để admin có thể thêm user thủ công
CREATE TABLE IF NOT EXISTS custom_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng custom_mangas (nếu muốn lưu trữ truyện riêng)
CREATE TABLE IF NOT EXISTS custom_mangas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'dropped')),
  created_by UUID REFERENCES custom_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng custom_chapters (nếu muốn lưu trữ chapter riêng)
CREATE TABLE IF NOT EXISTS custom_chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manga_id UUID REFERENCES custom_mangas(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT,
  content_url TEXT, -- URL đến nội dung chapter
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(manga_id, chapter_number)
);

-- RLS Policies cho custom_users
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;

-- Admin có thể xem tất cả users
CREATE POLICY "Admins can view all custom users" ON custom_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin có thể thêm users
CREATE POLICY "Admins can insert custom users" ON custom_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin có thể update users
CREATE POLICY "Admins can update custom users" ON custom_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin có thể delete users
CREATE POLICY "Admins can delete custom users" ON custom_users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies cho custom_mangas (nếu sử dụng)
ALTER TABLE custom_mangas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage custom mangas" ON custom_mangas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies cho custom_chapters (nếu sử dụng)
ALTER TABLE custom_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage custom chapters" ON custom_chapters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Trigger để tự động tạo profile khi user đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'username')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, username = EXCLUDED.username;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- RLS Policies cho profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users có thể xem profile của chính mình
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users có thể update profile của chính mình
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin có thể xem tất cả profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin có thể update tất cả profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Tạo user admin mặc định (chỉ chạy 1 lần)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
-- VALUES (
--   'admin-uuid-here', -- Thay bằng UUID thật
--   'admin@example.com',
--   crypt('admin123', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW(),
--   '{"username": "admin"}'::jsonb
-- ) ON CONFLICT DO NOTHING;

-- Sau đó tạo profile admin
-- INSERT INTO profiles (id, email, username, role)
-- VALUES ('admin-uuid-here', 'admin@example.com', 'admin', 'admin') ON CONFLICT DO NOTHING;