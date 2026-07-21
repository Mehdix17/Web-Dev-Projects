-- Enable Row Level Security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Select Policy: authenticated users can read their own files in the resumes bucket
CREATE POLICY "Allow authenticated users to read their own resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket = 'resumes' AND (storage.foldername(key))[1] = auth.uid()::text);

-- Insert Policy: authenticated users can write their own files in the resumes bucket
CREATE POLICY "Allow authenticated users to insert their own resumes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket = 'resumes' AND (storage.foldername(key))[1] = auth.uid()::text);

-- Update Policy: authenticated users can update their own files in the resumes bucket
CREATE POLICY "Allow authenticated users to update their own resumes"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket = 'resumes' AND (storage.foldername(key))[1] = auth.uid()::text)
WITH CHECK (bucket = 'resumes' AND (storage.foldername(key))[1] = auth.uid()::text);

-- Delete Policy: authenticated users can delete their own files in the resumes bucket
CREATE POLICY "Allow authenticated users to delete their own resumes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket = 'resumes' AND (storage.foldername(key))[1] = auth.uid()::text);
