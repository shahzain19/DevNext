import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useAuthStore } from '../../../store/useAuthStore';
import { getProjects, getClientProjects } from '../../../lib/db';
import type { Project } from '../../../lib/supabase';

export default function Projects() {
    const { profile } = useAuthStore();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'completed'>('all');

    useEffect(() => {
        loadProjects();
    }, [profile, filter]);

    const loadProjects = async () => {
        if (!profile) return;

        setLoading(true);
        try {
            const data = profile.role === 'client'
                ? await getClientProjects(profile.id)
                : await getProjects(filter === 'all' ? undefined : filter);
            setProjects(data);
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                    {profile?.role === 'client' ? 'My Projects' : 'Available Projects'}
                </h1>
                {profile?.role === 'client' && (
                    <Link to="/dashboard/projects/new">
                        <Button variant="primary">
                            <Plus className="w-5 h-5 mr-2" />
                            Post Project
                        </Button>
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-[var(--text-muted)]" />
                <div className="flex gap-2">
                    {(['all', 'open', 'in_progress', 'completed'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === status
                                ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {status === 'all' ? 'All' : status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Projects Grid */}
            {loading ? (
                <div className="text-center py-12 text-[var(--text-muted)]">
                    Loading projects...
                </div>
            ) : projects.length === 0 ? (
                <Card variant="glass" padding="lg">
                    <div className="text-center py-12">
                        <h3 className="text-xl font-bold mb-2">No projects found</h3>
                        <p className="text-[var(--text-secondary)]">
                            {profile?.role === 'client'
                                ? 'Create your first project to get started'
                                : 'Check back soon for new opportunities'}
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {projects.map((project) => (
                        <Card key={project.id} variant="glass" hover>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold">{project.title}</h3>
                                        <Badge
                                            variant={
                                                project.status === 'open'
                                                    ? 'success'
                                                    : project.status === 'in_progress'
                                                        ? 'info'
                                                        : project.status === 'completed'
                                                            ? 'default'
                                                            : 'error'
                                            }
                                        >
                                            {project.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <p className="text-[var(--text-secondary)] mb-4">
                                        {project.description}
                                    </p>
                                    <div className="flex items-center gap-6 text-sm">
                                        <span className="text-[var(--text-muted)]">
                                            Budget: ${project.budget_min.toLocaleString()} - $
                                            {project.budget_max.toLocaleString()}
                                        </span>
                                        <div className="flex gap-2">
                                            {project.stack.slice(0, 4).map((tech) => (
                                                <Badge key={tech} size="sm">
                                                    {tech}
                                                </Badge>
                                            ))}
                                            {project.stack.length > 4 && (
                                                <Badge size="sm">+{project.stack.length - 4}</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Link to={`/dashboard/projects/${project.id}`}>
                                    <Button variant="outline">View Details</Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
