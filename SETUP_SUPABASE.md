# Panduan Setup Supabase

Berikut adalah langkah-langkah untuk mengatur Supabase untuk aplikasi Admin Panel ini:

## 1. Buat Proyek Supabase

1. Buka [Supabase Dashboard](https://app.supabase.io/)
2. Klik "New Project"
3. Isi nama proyek dan password database
4. Pilih region terdekat
5. Klik "Create new project"

## 2. Setup Database

### Buat Tabel Products

1. Buka tab "Table Editor"
2. Klik "Create a new table"
3. Isi detail tabel:
   - Name: `products`
   - Columns:
     - `id` (type: uuid, primary key, default: `uuid_generate_v4()`)
     - `name` (type: text, not null)
     - `description` (type: text)
     - `price` (type: numeric, not null)
     - `image_url` (type: text)
     - `created_at` (type: timestamp with time zone, default: `now()`)
4. Klik "Save"

### Buat Tabel Profiles untuk Role-Based Access

1. Klik "Create a new table"
2. Isi detail tabel:
   - Name: `profiles`
   - Columns:
     - `id` (type: uuid, primary key, references: `auth.users.id`)
     - `role` (type: text, default: 'user')
     - `updated_at` (type: timestamp with time zone, default: `now()`)
3. Klik "Save"

## 3. Setup Storage

1. Buka tab "Storage"
2. Klik "Create a new bucket"
3. Isi detail bucket:
   - Name: `product-images`
   - Public access: Checked (untuk akses publik ke gambar)
4. Klik "Create bucket"

## 4. Setup Autentikasi

1. Buka tab "Authentication"
2. Di bagian "Providers", aktifkan "Email"
3. Opsional: Sesuaikan template email dan pengaturan lainnya

## 5. Setup Row Level Security (RLS)

### Untuk Tabel Products

1. Buka tab "Table Editor" dan pilih tabel "products"
2. Klik tab "Policies"
3. Klik "Add Policy"
4. Pilih template "Custom policy"
5. Isi detail policy:
   - Name: `Admin Access`
   - Using expression: `(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`
   - Policy definition: `true` (untuk semua operasi)
6. Klik "Save policy"

### Untuk Bucket Storage

1. Buka tab "Storage" dan pilih bucket "product-images"
2. Klik tab "Policies"
3. Tambahkan policy untuk akses publik ke gambar (read)
4. Tambahkan policy untuk admin (insert, update, delete)

## 6. Buat Admin User

1. Buka tab "Authentication" > "Users"
2. Klik "Invite user" atau buat user baru
3. Setelah user dibuat, buka SQL Editor
4. Jalankan query berikut untuk menjadikan user sebagai admin:
   ```sql
   INSERT INTO profiles (id, role)
   VALUES ('user-uuid', 'admin')
   ON CONFLICT (id) DO UPDATE SET role = 'admin';
   ```
   (Ganti 'user-uuid' dengan UUID user yang ingin dijadikan admin)

## 7. Dapatkan Kredensial API

1. Buka tab "Project Settings" > "API"
2. Salin "Project URL" dan "anon public" key
3. Tambahkan ke file `.env.local` aplikasi:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```