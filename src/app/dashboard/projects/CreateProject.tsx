import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Calendar, Target, Layers } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuthStore } from '../../../store/useAuthStore';
import { createProject } from '../../../lib/db';

export default function CreateProject() {
    const navigate = useNavigate();
    const { profile } = useAuthStore();
    const [loading, setLoading] = useState(false);

    // Redirect if not client (double protection)
    if (profile?.role !== 'client') {
        return (
            <Card variant="glass" padding="lg">
                <div className="text-center py-8">
                    <h3 className="text-xl font-bold text-[var(--error)]">Access Denied</h3>
                    <p className="text-[var(--text-secondary)] mt-2">Only clients can post new projects.</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>
                        Go Back
                    </Button>
                </div>
            </Card>
        );
    }

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget_min: '',
        budget_max: '',
        deadline: '',
        stack: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setLoading(true);
        try {
            await createProject({
                client_id: profile.id,
                title: formData.title,
                description: formData.description,
                budget_min: parseInt(formData.budget_min),
                budget_max: parseInt(formData.budget_max),
                deadline: new Date(formData.deadline).toISOString(),
                stack: formData.stack.split(',').map(s => s.trim()).filter(Boolean)
            });
            navigate('/dashboard/projects');
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Post a New Project</h1>
                <p className="text-[var(--text-secondary)]">
                    Describe your project details to attract top-tier builders.
                </p>
            </div>

            <Card variant="glass" padding="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        name="title"
                        label="Project Title"
                        placeholder="e.g. DeFi Trading Platform Frontend"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        icon={<Target className="w-5 h-5" />}
                    />

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            rows={6}
                            className="w-full px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all"
                            placeholder="Detailed description of the project, requirements, and scope..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Input
                            type="number"
                            name="budget_min"
                            label="Minimum Budget ($)"
                            placeholder="1000"
                            value={formData.budget_min}
                            onChange={handleChange}
                            required
                            icon={<DollarSign className="w-5 h-5" />}
                        />
                        <Input
                            type="number"
                            name="budget_max"
                            label="Maximum Budget ($)"
                            placeholder="5000"
                            value={formData.budget_max}
                            onChange={handleChange}
                            required
                            icon={<DollarSign className="w-5 h-5" />}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Input
                            type="date"
                            name="deadline"
                            label="Deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            required
                            icon={<Calendar className="w-5 h-5" />}
                        />
                        <Input
                            name="stack"
                            label="Tech Stack / Skills"
                            placeholder="React, Node.js, Solidity..."
                            helperText="Comma separated values"
                            value={formData.stack}
                            onChange={handleChange}
                            required
                            icon={<Layers className="w-5 h-5" />}
                        />
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-[var(--border-color)]">
                        <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/projects')}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={loading} className="flex-1">
                            Post Project
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
