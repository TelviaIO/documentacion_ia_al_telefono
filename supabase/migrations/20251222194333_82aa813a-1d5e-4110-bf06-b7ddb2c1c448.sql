-- Crear enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabla de roles de usuario
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función para verificar rol
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Tabla de secciones del menú
CREATE TABLE public.doc_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    parent_id UUID REFERENCES public.doc_sections(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.doc_sections ENABLE ROW LEVEL SECURITY;

-- Tabla de páginas de documentación
CREATE TABLE public.doc_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES public.doc_sections(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(section_id, slug)
);

ALTER TABLE public.doc_pages ENABLE ROW LEVEL SECURITY;

-- Tabla de imágenes
CREATE TABLE public.doc_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES public.doc_pages(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.doc_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies para doc_sections
CREATE POLICY "Anyone can read sections"
ON public.doc_sections FOR SELECT
USING (true);

CREATE POLICY "Admins can insert sections"
ON public.doc_sections FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sections"
ON public.doc_sections FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sections"
ON public.doc_sections FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para doc_pages
CREATE POLICY "Anyone can read pages"
ON public.doc_pages FOR SELECT
USING (true);

CREATE POLICY "Admins can insert pages"
ON public.doc_pages FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pages"
ON public.doc_pages FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pages"
ON public.doc_pages FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para doc_images
CREATE POLICY "Anyone can read images"
ON public.doc_images FOR SELECT
USING (true);

CREATE POLICY "Admins can insert images"
ON public.doc_images FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete images"
ON public.doc_images FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket para imágenes
INSERT INTO storage.buckets (id, name, public) VALUES ('doc-images', 'doc-images', true);

-- Storage policies
CREATE POLICY "Anyone can view doc images"
ON storage.objects FOR SELECT
USING (bucket_id = 'doc-images');

CREATE POLICY "Admins can upload doc images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'doc-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete doc images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'doc-images' AND public.has_role(auth.uid(), 'admin'));

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para timestamps
CREATE TRIGGER update_doc_sections_updated_at
BEFORE UPDATE ON public.doc_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doc_pages_updated_at
BEFORE UPDATE ON public.doc_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();