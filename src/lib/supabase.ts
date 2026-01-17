import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type UserRole = 'builder' | 'client' | 'admin';
export type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
    id: string;
    role: UserRole;
    name: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
    skills: string[];
    github_url?: string;
    portfolio_url?: string;
    cover_url?: string;
    phone?: string;
    verification: VerificationStatus;
    hourly_rate?: number;
    availability: boolean;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    client_id: string;
    title: string;
    description: string;
    budget_min: number;
    budget_max: number;
    deadline?: string;
    stack: string[];
    status: ProjectStatus;
    created_at: string;
}

export interface Application {
    id: string;
    project_id: string;
    builder_id: string;
    cover_letter?: string;
    status: string;
    created_at: string;
}

export interface Message {
    id: string;
    project_id?: string; // Optional for DMs
    conversation_id?: string; // Optional for Project chats (if we keep them separate) or required for DMs
    sender_id: string;
    receiver_id?: string;
    content: string;
    read: boolean;
    created_at: string;
}

export interface Conversation {
    id: string;
    participant_a: string;
    participant_b: string;
    last_message_at: string;
    created_at: string;
    other_user?: Profile; // Virtual field for UI
}

export interface Review {
    id: string;
    project_id?: string;
    reviewer_id?: string;
    reviewee_id?: string;
    rating: number;
    comment?: string;
    created_at: string;
}
