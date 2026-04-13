-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    country TEXT,
    is_demo_user BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create KYC verifications table
CREATE TABLE public.kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
    document_type TEXT CHECK (document_type IN ('passport', 'id_card', 'drivers_license')),
    document_number TEXT,
    document_front_url TEXT,
    document_back_url TEXT,
    selfie_url TEXT,
    rejection_reason TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
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

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for kyc_verifications
CREATE POLICY "Users can view own KYC"
ON public.kyc_verifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can submit own KYC"
ON public.kyc_verifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all KYC"
ON public.kyc_verifications FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all KYC"
ON public.kyc_verifications FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update platform_assets for token pricing
CREATE POLICY "Admins can update platform assets"
ON public.platform_assets FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert platform assets"
ON public.platform_assets FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kyc_updated_at
  BEFORE UPDATE ON public.kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();