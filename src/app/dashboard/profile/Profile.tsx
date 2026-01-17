import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Github, Globe, DollarSign, Phone, Camera, Upload, MessageCircle } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import { useAuthStore } from '../../../store/useAuthStore';
import { updateProfile, uploadAvatar, uploadCover, getProfileById, createConversation } from '../../../lib/db';
import type { Profile } from '../../../lib/supabase';

// Helper to generate deterministic gradients based on name
const getGradient = (name: string) => {
    const colors = [
        ['from-blue-400 to-indigo-500', 'from-blue-500 to-cyan-400'],
        ['from-emerald-400 to-teal-500', 'from-green-400 to-emerald-500'],
        ['from-orange-400 to-pink-500', 'from-red-400 to-orange-500'],
        ['from-purple-400 to-indigo-500', 'from-violet-400 to-purple-500'],
        ['from-pink-400 to-rose-500', 'from-rose-400 to-red-500']
    ];
    const index = name.length % colors.length;
    return colors[index];
};

export default function Profile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile: currentUserProfile, setProfile: setCurrentUserProfile } = useAuthStore();

    // State for the profile being VIEWED
    const [viewedProfile, setViewedProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Derived state
    const isOwnProfile = !id || (currentUserProfile && id === currentUserProfile.id);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        location: '',
        skills: '',
        github_url: '',
        portfolio_url: '',
        phone: '',
        hourly_rate: '',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadProfile();
    }, [id, currentUserProfile]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            if (isOwnProfile) {
                // We are viewing our own profile
                setViewedProfile(currentUserProfile);
            } else if (id) {
                // We are viewing someone else's profile
                const fetchedProfile = await getProfileById(id);
                setViewedProfile(fetchedProfile);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Sync form data when viewedProfile changes (only if it's our own profile)
    useEffect(() => {
        if (isOwnProfile && viewedProfile) {
            setFormData({
                name: viewedProfile.name || '',
                bio: viewedProfile.bio || '',
                location: viewedProfile.location || '',
                skills: viewedProfile.skills?.join(', ') || '',
                github_url: viewedProfile.github_url || '',
                portfolio_url: viewedProfile.portfolio_url || '',
                phone: viewedProfile.phone || '',
                hourly_rate: viewedProfile.hourly_rate?.toString() || '',
            });
        }
    }, [viewedProfile, isOwnProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isOwnProfile || !currentUserProfile) return;

        setSaving(true);
        try {
            const updated = await updateProfile(currentUserProfile.id, {
                name: formData.name,
                bio: formData.bio,
                location: formData.location,
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                github_url: formData.github_url,
                portfolio_url: formData.portfolio_url,
                phone: formData.phone,
                hourly_rate: formData.hourly_rate ? parseInt(formData.hourly_rate) : undefined,
            });
            setCurrentUserProfile(updated);
            setViewedProfile(updated); // Update local view immediately
            setEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
        if (!e.target.files || e.target.files.length === 0 || !currentUserProfile) return;
        const file = e.target.files[0];

        try {
            let publicUrl = '';
            if (type === 'avatar') {
                publicUrl = await uploadAvatar(currentUserProfile.id, file);
                const updated = await updateProfile(currentUserProfile.id, { avatar_url: publicUrl });
                setCurrentUserProfile(updated);
                setViewedProfile(updated);
            } else {
                publicUrl = await uploadCover(currentUserProfile.id, file);
                const updated = await updateProfile(currentUserProfile.id, { cover_url: publicUrl });
                setCurrentUserProfile(updated);
                setViewedProfile(updated);
            }
        } catch (error) {
            console.error(`Error uploading ${type}:`, error);
            alert(`Failed to upload ${type}`);
        }
    };

    const handleMessageClick = async () => {
        if (!viewedProfile) return;
        try {
            const conversation = await createConversation(viewedProfile.id);
            navigate(`/dashboard/messages?conversation=${conversation.id}`);
        } catch (error) {
            console.error('Error starting conversation:', error);
            alert('Failed to start conversation');
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-[var(--text-muted)] animate-pulse">Loading profile...</div>;
    }

    if (!viewedProfile) {
        return <div className="p-12 text-center text-[var(--text-muted)]">Profile not found.</div>;
    }

    const gradients = getGradient(viewedProfile.name || 'User');

    return (
        <div className="max-w-4xl space-y-6 mx-auto">
            {/* Cover Photo Header */}
            <div className="relative mb-20">
                <div className={`rounded-xl overflow-hidden h-64 border border-[var(--border-color)] relative group bg-gradient-to-r ${gradients[0]}`}>
                    {viewedProfile.cover_url ? (
                        <img src={viewedProfile.cover_url} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full opacity-50 bg-gradient-to-r ${gradients[0]}`} />
                    )}

                    {/* Cover Upload Button - Only visible if own profile */}
                    {isOwnProfile && (
                        <>
                            <input
                                type="file"
                                ref={coverInputRef}
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'cover')}
                                accept="image/*"
                            />
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" onClick={() => coverInputRef.current?.click()}>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Change Cover
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                {/* Avatar */}
                <div className="absolute -bottom-16 left-8 z-20">
                    <div className="relative group/avatar">
                        <div className={`w-36 h-36 rounded-full border-4 border-[var(--bg-primary)] shadow-xl overflow-hidden bg-white flex items-center justify-center`}>
                            {viewedProfile.avatar_url ? (
                                <img src={viewedProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${gradients[1]} flex items-center justify-center text-white text-5xl font-bold`}>
                                    {viewedProfile.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {isOwnProfile && (
                            <>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, 'avatar')}
                                    accept="image/*"
                                />
                                <button
                                    className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 text-[var(--text-secondary)] opacity-0 group-hover/avatar:opacity-100 transition-all transform scale-90 group-hover/avatar:scale-100"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Change Avatar"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Info & Actions */}
            <div className="flex items-start justify-between px-2">
                <div className="pt-2">
                    <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">{viewedProfile.name}</h1>
                    <div className="flex items-center gap-3 mt-3">
                        <Badge variant={viewedProfile.verification === 'approved' ? 'success' : 'warning'}>
                            {viewedProfile.verification}
                        </Badge>
                        <Badge variant="info" className="capitalize">
                            {viewedProfile.role}
                        </Badge>
                    </div>
                </div>

                <div className="flex gap-3">
                    {isOwnProfile ? (
                        !editing && (
                            <Button variant="primary" onClick={() => setEditing(true)}>
                                Edit Profile
                            </Button>
                        )
                    ) : (
                        <Button variant="primary" onClick={handleMessageClick}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                        </Button>
                    )}
                </div>
            </div>

            {editing && isOwnProfile ? (
                <Card variant="glass" padding="lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Input
                                type="text"
                                name="name"
                                label="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                type="tel"
                                name="phone"
                                label="Phone Number"
                                icon={<Phone className="w-5 h-5" />}
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                Bio & Introduction
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Input
                                type="text"
                                name="location"
                                label="Location"
                                value={formData.location}
                                onChange={handleChange}
                                icon={<MapPin className="w-5 h-5" />}
                            />
                            {viewedProfile.role === 'builder' && (
                                <Input
                                    type="number"
                                    name="hourly_rate"
                                    label="Hourly Rate (USD)"
                                    value={formData.hourly_rate}
                                    onChange={handleChange}
                                    icon={<DollarSign className="w-5 h-5" />}
                                />
                            )}
                        </div>

                        <Input
                            type="text"
                            name="skills"
                            label="Skills"
                            value={formData.skills}
                            onChange={handleChange}
                            helperText="Separate skills with commas (e.g. React, Node.js, Design)"
                        />

                        <div className="grid md:grid-cols-2 gap-6">
                            <Input
                                type="url"
                                name="github_url"
                                label="GitHub URL"
                                value={formData.github_url}
                                onChange={handleChange}
                                icon={<Github className="w-5 h-5" />}
                            />

                            <Input
                                type="url"
                                name="portfolio_url"
                                label="Portfolio URL"
                                value={formData.portfolio_url}
                                onChange={handleChange}
                                icon={<Globe className="w-5 h-5" />}
                            />
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                            <Button type="submit" variant="primary" loading={saving}>
                                Save Changes
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setEditing(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Left Column: Info */}
                    <div className="md:col-span-2 space-y-6">
                        <Card variant="glass" padding="lg">
                            <h3 className="text-xl font-bold mb-4 font-display">About</h3>
                            {viewedProfile.bio ? (
                                <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                                    {viewedProfile.bio}
                                </p>
                            ) : (
                                <p className="text-[var(--text-muted)] italic">
                                    No bio added yet.
                                </p>
                            )}
                        </Card>

                        {viewedProfile.skills && viewedProfile.skills.length > 0 && (
                            <Card variant="glass" padding="lg">
                                <h3 className="text-xl font-bold mb-4 font-display">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {viewedProfile.skills.map((skill) => (
                                        <Badge key={skill} size="lg" variant="default" className="text-sm px-3 py-1">{skill}</Badge>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Contact & Stats */}
                    <div className="space-y-6">
                        <Card variant="glass" padding="lg">
                            <h3 className="text-lg font-bold mb-5 font-display">Contact & Details</h3>
                            <div className="space-y-5">
                                {viewedProfile.location && (
                                    <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium">{viewedProfile.location}</span>
                                    </div>
                                )}
                                {viewedProfile.phone && (
                                    <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium">{viewedProfile.phone}</span>
                                    </div>
                                )}
                                {viewedProfile.hourly_rate && (
                                    <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium">${viewedProfile.hourly_rate}/hr</span>
                                    </div>
                                )}
                            </div>

                            <hr className="my-5 border-[var(--border-color)]" />

                            <div className="space-y-3">
                                {viewedProfile.github_url && (
                                    <a
                                        href={viewedProfile.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border-color)] transition-all text-[var(--text-primary)] font-medium"
                                    >
                                        <Github className="w-5 h-5" />
                                        GitHub Profile
                                    </a>
                                )}
                                {viewedProfile.portfolio_url && (
                                    <a
                                        href={viewedProfile.portfolio_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border-color)] transition-all text-[var(--text-primary)] font-medium"
                                    >
                                        <Globe className="w-5 h-5" />
                                        Portfolio Website
                                    </a>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
