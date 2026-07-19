-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.quote_sources (
  id integer NOT NULL DEFAULT nextval('quote_sources_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  CONSTRAINT quote_sources_pkey PRIMARY KEY (id)
);
CREATE TABLE public.general_quotes (
  id bigint NOT NULL DEFAULT nextval('general_quotes_id_seq'::regclass),
  source_id integer NOT NULL,
  content text NOT NULL,
  author_or_ref character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT general_quotes_pkey PRIMARY KEY (id),
  CONSTRAINT general_quotes_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.quote_sources(id)
);
CREATE TABLE public.image_templates (
  id integer NOT NULL DEFAULT nextval('image_templates_id_seq'::regclass),
  name character varying NOT NULL,
  background_url text,
  background_color character varying,
  font_style character varying,
  category character varying,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT image_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  full_name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  avatar_url text,
  role character varying NOT NULL DEFAULT 'user'::character varying CHECK (role::text = ANY (ARRAY['user'::character varying, 'admin'::character varying, 'superadmin'::character varying]::text[])),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.ayat_refs (
  id bigint NOT NULL DEFAULT nextval('ayat_refs_id_seq'::regclass),
  surah_number smallint NOT NULL CHECK (surah_number >= 1 AND surah_number <= 114),
  ayat_number smallint NOT NULL CHECK (ayat_number > 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ayat_refs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ayat_moods (
  ayat_ref_id bigint NOT NULL,
  mood character varying NOT NULL,
  CONSTRAINT ayat_moods_pkey PRIMARY KEY (ayat_ref_id, mood),
  CONSTRAINT ayat_moods_ayat_ref_id_fkey FOREIGN KEY (ayat_ref_id) REFERENCES public.ayat_refs(id)
);
CREATE TABLE public.user_ayat_history (
  id bigint NOT NULL DEFAULT nextval('user_ayat_history_id_seq'::regclass),
  user_id uuid NOT NULL,
  ayat_ref_id bigint NOT NULL,
  mood character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_ayat_history_pkey PRIMARY KEY (id),
  CONSTRAINT user_ayat_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_ayat_history_ayat_ref_id_fkey FOREIGN KEY (ayat_ref_id) REFERENCES public.ayat_refs(id)
);
CREATE TABLE public.saved_quote_images (
  id bigint NOT NULL DEFAULT nextval('saved_quote_images_id_seq'::regclass),
  user_id uuid NOT NULL,
  ayat_ref_id bigint,
  general_quote_id bigint,
  template_id integer,
  mood character varying,
  image_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT saved_quote_images_pkey PRIMARY KEY (id),
  CONSTRAINT saved_quote_images_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT saved_quote_images_ayat_ref_id_fkey FOREIGN KEY (ayat_ref_id) REFERENCES public.ayat_refs(id),
  CONSTRAINT saved_quote_images_general_quote_id_fkey FOREIGN KEY (general_quote_id) REFERENCES public.general_quotes(id),
  CONSTRAINT saved_quote_images_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.image_templates(id)
);
CREATE TABLE public.consultants (
  id bigint NOT NULL DEFAULT nextval('consultants_id_seq'::regclass),
  user_id uuid UNIQUE,
  full_name character varying NOT NULL,
  bio text,
  photo_url text,
  specialization character varying,
  is_paid_service boolean NOT NULL DEFAULT false,
  price_per_session numeric DEFAULT 0,
  rating_avg numeric DEFAULT 0,
  verification_status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (verification_status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying]::text[])),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT consultants_pkey PRIMARY KEY (id),
  CONSTRAINT consultants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.consultant_availability (
  id bigint NOT NULL DEFAULT nextval('consultant_availability_id_seq'::regclass),
  consultant_id bigint NOT NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  CONSTRAINT consultant_availability_pkey PRIMARY KEY (id),
  CONSTRAINT consultant_availability_consultant_id_fkey FOREIGN KEY (consultant_id) REFERENCES public.consultants(id)
);
CREATE TABLE public.consultations (
  id bigint NOT NULL DEFAULT nextval('consultations_id_seq'::regclass),
  user_id uuid NOT NULL,
  consultant_id bigint NOT NULL,
  user_ayat_history_id bigint,
  mood character varying,
  session_type character varying NOT NULL DEFAULT 'chat'::character varying CHECK (session_type::text = ANY (ARRAY['chat'::character varying, 'call'::character varying, 'video'::character varying]::text[])),
  scheduled_at timestamp with time zone NOT NULL,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'confirmed'::character varying, 'ongoing'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT consultations_pkey PRIMARY KEY (id),
  CONSTRAINT consultations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT consultations_consultant_id_fkey FOREIGN KEY (consultant_id) REFERENCES public.consultants(id),
  CONSTRAINT consultations_user_ayat_history_id_fkey FOREIGN KEY (user_ayat_history_id) REFERENCES public.user_ayat_history(id)
);
CREATE TABLE public.consultation_payments (
  id bigint NOT NULL DEFAULT nextval('consultation_payments_id_seq'::regclass),
  consultation_id bigint NOT NULL UNIQUE,
  amount numeric NOT NULL DEFAULT 0,
  payment_method character varying,
  payment_status character varying NOT NULL DEFAULT 'unpaid'::character varying CHECK (payment_status::text = ANY (ARRAY['unpaid'::character varying, 'paid'::character varying, 'refunded'::character varying, 'failed'::character varying]::text[])),
  paid_at timestamp with time zone,
  CONSTRAINT consultation_payments_pkey PRIMARY KEY (id),
  CONSTRAINT consultation_payments_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id)
);
CREATE TABLE public.consultant_reviews (
  id bigint NOT NULL DEFAULT nextval('consultant_reviews_id_seq'::regclass),
  consultation_id bigint NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  consultant_id bigint NOT NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT consultant_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT consultant_reviews_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id),
  CONSTRAINT consultant_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT consultant_reviews_consultant_id_fkey FOREIGN KEY (consultant_id) REFERENCES public.consultants(id)
);
CREATE TABLE public.admin_audit_logs (
  id bigint NOT NULL DEFAULT nextval('admin_audit_logs_id_seq'::regclass),
  admin_id uuid NOT NULL,
  action character varying NOT NULL,
  target_table character varying,
  target_id bigint,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT admin_audit_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id)
);