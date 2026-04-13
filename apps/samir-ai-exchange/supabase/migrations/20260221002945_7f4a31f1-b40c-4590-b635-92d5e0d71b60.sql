
-- Add RLS policies for kyc-documents storage bucket
-- Users can only upload to their own folder
CREATE POLICY "Users can upload own KYC docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own uploaded documents
CREATE POLICY "Users can view own KYC docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update/replace their own documents
CREATE POLICY "Users can update own KYC docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own documents
CREATE POLICY "Users can delete own KYC docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
