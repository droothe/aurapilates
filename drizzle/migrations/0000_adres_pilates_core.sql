-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- First account ever created becomes the admin
CREATE OR REPLACE FUNCTION public.grant_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_grant_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_first_admin();

-- Trainings
CREATE TYPE public.training_status AS ENUM ('open', 'limited', 'full', 'closed');

CREATE TABLE public.trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  category text NOT NULL DEFAULT 'mat',
  subtitle text,
  date_label text NOT NULL,
  month_label text NOT NULL,
  start_date date NOT NULL,
  duration_days int NOT NULL DEFAULT 2,
  format text NOT NULL DEFAULT 'Yüz yüze',
  city text NOT NULL DEFAULT 'İstanbul',
  venue text,
  early_bird boolean NOT NULL DEFAULT false,
  status public.training_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trainings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trainings TO authenticated;
GRANT ALL ON public.trainings TO service_role;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible trainings" ON public.trainings
  FOR SELECT TO anon, authenticated USING (status <> 'closed' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert trainings" ON public.trainings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update trainings" ON public.trainings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete trainings" ON public.trainings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trainings_touch BEFORE UPDATE ON public.trainings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.trainings (code, category, subtitle, date_label, month_label, start_date, duration_days, venue, early_bird, status) VALUES
  ('MAT 1', 'mat', '+ Hareket Temelleri', '20–21–22', 'Kasım 2026', '2026-11-20', 3, 'Mec Pilates Studio', false, 'limited'),
  ('REFORMER 1', 'reformer', 'Reformer Temel Seviye', '28–29', 'Kasım 2026', '2026-11-28', 2, 'Mec Pilates Studio', false, 'open'),
  ('MAT 2', 'mat', 'Mat İleri Seviye', '12–13', 'Aralık 2026', '2026-12-12', 2, 'Mec Pilates Studio', true, 'open'),
  ('REFORMER 2', 'reformer', 'Reformer İleri Seviye', '19–20', 'Aralık 2026', '2026-12-19', 2, 'Mec Pilates Studio', true, 'open'),
  ('TRAPEZE TABLE 1-2-3', 'trapeze', 'Cadillac / Trapeze Table Uzmanlığı', '26–27–28', 'Şubat 2027', '2027-02-26', 3, 'Core&Fit Pilates Studio', false, 'open');

-- Applications
CREATE TYPE public.application_status AS ENUM ('new', 'contacted', 'enrolled', 'cancelled');

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  course text NOT NULL,
  training_id uuid REFERENCES public.trainings(id) ON DELETE SET NULL,
  notes text,
  status public.application_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an application" ON public.applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'new'
    AND char_length(full_name) BETWEEN 2 AND 100
    AND char_length(phone) BETWEEN 7 AND 25
    AND char_length(course) BETWEEN 2 AND 150
    AND (notes IS NULL OR char_length(notes) <= 1000)
  );
CREATE POLICY "Admins view applications" ON public.applications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update applications" ON public.applications
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete applications" ON public.applications
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));