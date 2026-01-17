-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for authenticated uploads
CREATE POLICY "Authenticated users can upload message attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'message-attachments');

-- Policy for viewing attachments
CREATE POLICY "Public access to message attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'message-attachments');
