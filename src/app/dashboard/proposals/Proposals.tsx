import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, ExternalLink } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { useAuthStore } from '../../../store/useAuthStore';
import { getApplicationsByBuilder } from '../../../lib/db';
import type { Application, Project } from '../../../lib/supabase';

interface ExtendedApplication extends Application {
    projects: Project;
}

export default function Proposals() {
    const { profile } = useAuthStore();
    const [applications, setApplications] = useState<ExtendedApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile?.id) {
            loadApplications(profile.id);
        }
    }, [profile]);

    const loadApplications = async (userId: string) => {
        try {
            const data = await getApplicationsByBuilder(userId);
            setApplications(data as unknown as ExtendedApplication[]);
        } catch (error) {
            console.error('Error loading proposals:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">Loading proposals...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Proposals</h1>
                    <p className="text-[var(--text-secondary)]">Track the status of your project applications.</p>
                </div>
            </div>

            {applications.length === 0 ? (
                <Card variant="glass" padding="lg" className="text-center py-16">
                    <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-[var(--text-muted)]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Proposals Yet</h3>
                    <p className="text-[var(--text-secondary)] mb-6">You haven't applied to any projects yet.</p>
                    <Link to="/dashboard/projects">
                        <Button variant="primary">Browse Projects</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {applications.map((app) => (
                        <Card key={app.id} variant="glass" className="hover:border-[var(--accent-primary)] transition-colors group">
                            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold group-hover:text-[var(--accent-primary)] transition-colors">
                                            {app.projects?.title || 'Unknown Project'}
                                        </h3>
                                        <Badge
                                            variant={
                                                app.status === 'accepted' ? 'success' :
                                                    app.status === 'rejected' ? 'error' : 'info'
                                            }
                                        >
                                            {app.status.toUpperCase()}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-[var(--text-muted)] mb-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Applied {new Date(app.created_at).toLocaleDateString()}
                                        </div>
                                        <div>
                                            Budget: ${app.projects?.budget_min.toLocaleString()} - ${app.projects?.budget_max.toLocaleString()}
                                        </div>
                                    </div>

                                    <p className="text-[var(--text-secondary)] line-clamp-2 text-sm italic border-l-2 border-[var(--border-color)] pl-3">
                                        "{app.cover_letter}"
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link to={`/dashboard/projects/${app.project_id}`}>
                                        <Button variant="outline" size="sm">
                                            View Project <ExternalLink className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                    {app.status === 'accepted' && (
                                        <Link to={`/dashboard/messages?conversation_new=${app.projects?.client_id}`}>
                                            <Button variant="primary" size="sm">
                                                Message Client
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
