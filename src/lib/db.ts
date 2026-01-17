import { supabase } from './supabase';
import type { Profile, Project, Application, Message, Review, ProjectStatus } from './supabase';

// ===============================
// 👤 PROFILES
// ===============================

export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data as Profile;
}

export async function getVerifiedBuilders() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'builder')
        .eq('verification', 'approved')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Profile[];
}

export async function searchBuilders(skills?: string[], location?: string) {
    let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'builder')
        .eq('verification', 'approved');

    if (skills && skills.length > 0) {
        query = query.contains('skills', skills);
    }

    if (location) {
        query = query.ilike('location', `%${location}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as Profile[];
}

// ===============================
// 📦 PROJECTS
// ===============================

// Get a public profile by ID
export async function getProfileById(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null; // Return null instead of throwing for better UI handling
    }
    return data as Profile;
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'status'>) {
    const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

    if (error) throw error;
    return data as Project;
}

export async function getProject(projectId: string) {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (error) throw error;
    return data as Project;
}

export async function updateProject(projectId: string, updates: Partial<Project>) {
    const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

    if (error) throw error;
    return data as Project;
}

export async function getProjects(status?: ProjectStatus) {
    let query = supabase.from('projects').select('*');

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as Project[];
}

export async function getClientProjects(clientId: string) {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Project[];
}

// ===============================
// 🤝 APPLICATIONS
// ===============================

export async function createApplication(application: Omit<Application, 'id' | 'created_at' | 'status'>) {
    const { data, error } = await supabase
        .from('applications')
        .insert(application)
        .select()
        .single();

    if (error) throw error;
    return data as Application;
}

export async function getApplicationsByProject(projectId: string) {
    const { data, error } = await supabase
        .from('applications')
        .select('*, profiles(*)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getApplicationsByBuilder(builderId: string) {
    const { data, error } = await supabase
        .from('applications')
        .select('*, projects(*)')
        .eq('builder_id', builderId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function updateApplicationStatus(applicationId: string, status: string) {
    const { data, error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId)
        .select()
        .single();

    if (error) throw error;
    return data as Application;
}

// ===============================
// 💬 MESSAGES
// ===============================

// ===============================
// 💬 MESSAGES & CONVERSATIONS
// ===============================

export async function createConversation(otherUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Ensure strict order to prevent duplicate conversations (A-B vs B-A)
    const [userA, userB] = [user.id, otherUserId].sort();

    // Check if exists first
    const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('participant_a', userA)
        .eq('participant_b', userB)
        .single();

    if (existing) return existing;

    const { data, error } = await supabase
        .from('conversations')
        .insert({
            participant_a: userA,
            participant_b: userB
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getConversations() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('conversations')
        .select(`
            *,
            participant_a_profile:profiles!participant_a(*),
            participant_b_profile:profiles!participant_b(*)
        `)
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Transform to friendly format
    return data.map((conv: any) => ({
        ...conv,
        other_user: conv.participant_a === user.id ? conv.participant_b_profile : conv.participant_a_profile
    }));
}

export async function getConversationMessages(conversationId: string) {
    const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(*)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
}

export async function sendMessage(message: Partial<Message>) {
    const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();

    if (error) throw error;

    // Update conversation timestamp
    if (message.conversation_id) {
        await supabase
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', message.conversation_id);
    }

    return data as Message;
}

export async function subscribeToConversation(conversationId: string, callback: (message: Message) => void) {
    return supabase
        .channel(`conversation:${conversationId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
                callback(payload.new as Message);
            }
        )
        .subscribe();
}

// ===============================
// ⭐ REVIEWS
// ===============================

export async function createReview(review: Omit<Review, 'id' | 'created_at'>) {
    const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single();

    if (error) throw error;
    return data as Review;
}

export async function getProfileReviews(profileId: string) {
    const { data, error } = await supabase
        .from('reviews')
        .select('*, reviewer:profiles!reviewer_id(*)')
        .eq('reviewee_id', profileId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

// ===============================
// 🧠 MATCHING
// ===============================

export async function matchBuilders(projectId: string) {
    const { data, error } = await supabase.rpc('match_builders', {
        project: projectId,
    });

    if (error) throw error;
    return data;
}

// ===============================
// 📂 STORAGE
// ===============================

export async function uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);

    return data.publicUrl;
}

export async function uploadPortfolio(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('portfolios')
        .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('portfolios').getPublicUrl(fileName);

    return data.publicUrl;
}

export async function uploadCover(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/cover_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('covers').getPublicUrl(fileName);

    return data.publicUrl;
}

export async function uploadMessageAttachment(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}_attachment.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('message-attachments').getPublicUrl(fileName);

    return data.publicUrl;
}
