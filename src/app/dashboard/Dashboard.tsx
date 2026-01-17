import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, MessageSquare, TrendingUp, Plus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuthStore } from '../../store/useAuthStore';
import { getProjects, getClientProjects } from '../../lib/db';
import type { Project } from '../../lib/supabase';

export default function Dashboard() {
    const { profile } = useAuthStore();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, [profile]);

    const loadProjects = async () => {
        if (!profile) return;

        try {
            const data = profile.role === 'client'
                ? await getClientProjects(profile.id)
                : await getProjects('open');
            setProjects(data.slice(0, 5));
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: 'Active Projects',
            value: '12',
            icon: Briefcase,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            label: 'Total Builders',
            value: '500+',
            icon: Users,
            color: 'from-purple-500 to-pink-500',
        },
        {
            label: 'Messages',
            value: '24',
            icon: MessageSquare,
            color: 'from-green-500 to-emerald-500',
        },
        {
            label: 'Success Rate',
            value: '98%',
            icon: TrendingUp,
            color: 'from-orange-500 to-red-500',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome back, <span className="gradient-text">{profile?.name}</span>
                    </h1>
                    <p className="text-[var(--text-secondary)]">
                        Here's what's happening with your projects today.
                    </p>
                </div>
                {profile?.role === 'client' && (
                    <Link to="/dashboard/projects">
                        <Button variant="primary">
                            <Plus className="w-5 h-5 mr-2" />
                            New Project
                        </Button>
                    </Link>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card
                        key={index}
                        variant="glass"
                        hover
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[var(--text-muted)] text-sm mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Recent Projects */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">
                        {profile?.role === 'client' ? 'Your Projects' : 'Available Projects'}
                    </h2>
                    <Link to="/dashboard/projects">
                        <Button variant="ghost">View All</Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-[var(--text-muted)]">
                        Loading projects...
                    </div>
                ) : projects.length === 0 ? (
                    <Card variant="glass" padding="lg">
                        <div className="text-center py-12">
                            <Briefcase className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
                            <p className="text-[var(--text-secondary)] mb-6">
                                {profile?.role === 'client'
                                    ? 'Create your first project to get started'
                                    : 'Check back soon for new opportunities'}
                            </p>
                            {profile?.role === 'client' && (
                                <Link to="/dashboard/projects">
                                    <Button variant="primary">
                                        <Plus className="w-5 h-5 mr-2" />
                                        Create Project
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {projects.map((project) => (
                            <Card key={project.id} variant="glass" hover>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold">{project.title}</h3>
                                            <Badge variant={project.status === 'open' ? 'success' : 'default'}>
                                                {project.status}
                                            </Badge>
                                        </div>
                                        <p className="text-[var(--text-secondary)] mb-4 line-clamp-2">
                                            {project.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-[var(--text-muted)]">
                                                Budget: ${project.budget_min.toLocaleString()} - ${project.budget_max.toLocaleString()}
                                            </span>
                                            <div className="flex gap-2">
                                                {project.stack.slice(0, 3).map((tech) => (
                                                    <Badge key={tech} size="sm">{tech}</Badge>
                                                ))}
                                                {project.stack.length > 3 && (
                                                    <Badge size="sm">+{project.stack.length - 3}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Link to={`/dashboard/projects/${project.id}`}>
                                        <Button variant="outline" size="sm">View</Button>
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
