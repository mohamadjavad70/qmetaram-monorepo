
-- Create private KYC documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Admins can view all KYC documents
CREATE POLICY "Admins can view KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can upload KYC documents
CREATE POLICY "Admins can upload KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can delete KYC documents
CREATE POLICY "Admins can delete KYC documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Users can upload their own KYC documents (stored in user_id folder)
CREATE POLICY "Users can upload own KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own KYC documents
CREATE POLICY "Users can view own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
