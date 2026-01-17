-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participant_a UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    participant_b UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_a, participant_b)
);

-- Enable RLS on conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
    ON conversations FOR SELECT
    TO authenticated
    USING (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Users can create conversations"
    ON conversations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Users can update their conversations"
    ON conversations FOR UPDATE
    TO authenticated
    USING (auth.uid() = participant_a OR auth.uid() = participant_b);

-- Update messages table for DMs
ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE,
    ALTER COLUMN project_id DROP NOT NULL; -- Allow messages without a project (DMs)

-- Update messages RLS to allow DMs
DROP POLICY IF EXISTS "Users can view messages for their projects" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their projects" ON messages;

CREATE POLICY "Users can view messages they are involved in"
    ON messages FOR SELECT
    TO authenticated
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id OR
        project_id IN (
            -- Keep project logic: If user is client or builder of the project
            SELECT id FROM projects WHERE client_id = auth.uid() -- Project owner
            UNION
            SELECT project_id FROM applications WHERE builder_id = auth.uid() AND status = 'approved' -- Approved builder
        )
    );

CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);
