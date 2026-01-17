-- Add deadline column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;

-- Comment on column
COMMENT ON COLUMN projects.deadline IS 'The deadline for project completion';
