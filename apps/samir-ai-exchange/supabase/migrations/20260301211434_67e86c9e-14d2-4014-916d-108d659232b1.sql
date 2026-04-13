
-- Add new secure columns for document number
ALTER TABLE public.kyc_verifications
  ADD COLUMN IF NOT EXISTS document_number_hash text,
  ADD COLUMN IF NOT EXISTS document_number_masked text;

-- Migrate existing plaintext data: hash and mask
-- Note: We use MD5 here as a one-way hash for the migration since HMAC requires the edge function.
-- Future inserts should use HMAC-SHA256 via the hash-sensitive-data edge function.
UPDATE public.kyc_verifications
SET
  document_number_masked = CASE
    WHEN document_number IS NOT NULL AND length(document_number) > 4
    THEN '****' || right(document_number, 4)
    WHEN document_number IS NOT NULL
    THEN '****'
    ELSE NULL
  END,
  document_number_hash = CASE
    WHEN document_number IS NOT NULL
    THEN md5(document_number)
    ELSE NULL
  END
WHERE document_number IS NOT NULL;

-- Drop the plaintext column
ALTER TABLE public.kyc_verifications DROP COLUMN IF EXISTS document_number;
