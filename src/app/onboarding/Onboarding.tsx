import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Github, Globe, DollarSign, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useAuthStore } from '../../store/useAuthStore';
import { updateProfile } from '../../lib/db';

export default function Onboarding() {
    const navigate = useNavigate();
    const { profile } = useAuthStore();
    const [formData, setFormData] = useState({
        bio: '',
        location: '',
        skills: '',
        github_url: '',
        portfolio_url: '',
        hourly_rate: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setLoading(true);
        try {
            await updateProfile(profile.id, {
                bio: formData.bio,
                location: formData.location,
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                github_url: formData.github_url,
                portfolio_url: formData.portfolio_url,
                hourly_rate: formData.hourly_rate ? parseInt(formData.hourly_rate) : undefined,
            });
            navigate('/dashboard');
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-3">
                        Welcome to <span className="gradient-text">BuilderNet</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg">
                        Let's set up your profile to get started
                    </p>
                </div>

                <Card variant="glass" padding="lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                Bio
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself..."
                                rows={4}
                                className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        {/* Location */}
                        <Input
                            type="text"
                            name="location"
                            label="Location"
                            placeholder="San Francisco, CA"
                            value={formData.location}
                            onChange={handleChange}
                            icon={<MapPin className="w-5 h-5" />}
                        />

                        {/* Skills */}
                        <Input
                            type="text"
                            name="skills"
                            label="Skills"
                            placeholder="React, Node.js, TypeScript, PostgreSQL"
                            value={formData.skills}
                            onChange={handleChange}
                            helperText="Separate skills with commas"
                            required
                        />

                        {/* GitHub */}
                        <Input
                            type="url"
                            name="github_url"
                            label="GitHub Profile"
                            placeholder="https://github.com/username"
                            value={formData.github_url}
                            onChange={handleChange}
                            icon={<Github className="w-5 h-5" />}
                        />

                        {/* Portfolio */}
                        <Input
                            type="url"
                            name="portfolio_url"
                            label="Portfolio Website"
                            placeholder="https://yourportfolio.com"
                            value={formData.portfolio_url}
                            onChange={handleChange}
                            icon={<Globe className="w-5 h-5" />}
                        />

                        {/* Hourly Rate (for builders) */}
                        {profile?.role === 'builder' && (
                            <Input
                                type="number"
                                name="hourly_rate"
                                label="Hourly Rate (USD)"
                                placeholder="50"
                                value={formData.hourly_rate}
                                onChange={handleChange}
                                icon={<DollarSign className="w-5 h-5" />}
                            />
                        )}

                        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Complete Setup
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
