-- =============================================================
-- CAMPUS CLOCK — SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Run this script in the Supabase SQL Editor to initialize all tables
-- =============================================================

-- 1. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('management', 'hod', 'teacher', 'student')),
  department_id UUID,
  division_id UUID,
  faculty_initial TEXT,
  must_change_password BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  hod_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Divisions Table
CREATE TABLE IF NOT EXISTS public.divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  class_teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
  strength INT NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lecture', 'practical', 'tutorial')),
  weekly_hours INT NOT NULL DEFAULT 4,
  needs_lab BOOLEAN DEFAULT false,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('classroom', 'lab', 'seminar')),
  capacity INT NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Faculty Table
CREATE TABLE IF NOT EXISTS public.faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  initials TEXT NOT NULL,
  max_per_day INT NOT NULL DEFAULT 3,
  unavailable_slots TEXT[] DEFAULT '{}',
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Timetables Table
CREATE TABLE IF NOT EXISTS public.timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  division_id UUID REFERENCES public.divisions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Timetable Entries Table
CREATE TABLE IF NOT EXISTS public.timetable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id UUID REFERENCES public.timetables(id) ON DELETE CASCADE,
  day INT NOT NULL CHECK (day BETWEEN 1 AND 5),
  slot INT NOT NULL CHECK (slot BETWEEN 1 AND 7),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES public.faculty(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('lecture', 'practical', 'tutorial')),
  is_locked BOOLEAN DEFAULT false
);

-- 9. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read of published timetables and profiles
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Published timetables viewable by all" ON public.timetables FOR SELECT USING (status = 'published');

