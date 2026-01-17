import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, Calendar, CheckCircle, XCircle, Send } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import { getProject, createApplication, getApplicationsByProject, updateApplicationStatus } from '../../../lib/db';
import { useAuthStore } from '../../../store/useAuthStore';
import type { Project, Application, Profile } from '../../../lib/supabase';

// Extended Application type to include profile join
interface ExtendedApplication extends Application {
    profiles: Profile;
}

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const { profile: userProfile } = useAuthStore();
    const [project, setProject] = useState<Project | null>(null);
    const [applications, setApplications] = useState<ExtendedApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [showApplyForm, setShowApplyForm] = useState(false); // Toggle for apply form

    useEffect(() => {
        if (id) {
            loadData(id);
        }
    }, [id, userProfile]);

    const loadData = async (projectId: string) => {
        try {
            const [projectData, applicationsData] = await Promise.all([
                getProject(projectId),
                getApplicationsByProject(projectId)
            ]);
            setProject(projectData);
            setApplications(applicationsData as unknown as ExtendedApplication[]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project || !userProfile) return;

        setApplying(true);
        try {
            await createApplication({
                project_id: project.id,
                builder_id: userProfile.id,
                cover_letter: coverLetter,
            });
            // Reload applications to show the new one
            const newApps = await getApplicationsByProject(project.id);
            setApplications(newApps as unknown as ExtendedApplication[]);
            setShowApplyForm(false);
            alert('Application submitted successfully!');
        } catch (error: any) {
            console.error('Error applying:', error);
            alert(error.message || 'Failed to apply');
        } finally {
            setApplying(false);
        }
    };

    const handleUpdateStatus = async (appId: string, status: 'accepted' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${status} this application?`)) return;
        try {
            await updateApplicationStatus(appId, status);
            // Optimistic update
            setApplications(apps => apps.map(app =>
                app.id === appId ? { ...app, status } : app
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12 text-[var(--text-muted)]">
                Loading project...
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-2">Project not found</h2>
                <Link to="/dashboard/projects">
                    <Button variant="outline">Back to Projects</Button>
                </Link>
            </div>
        );
    }

    const isClient = userProfile?.role === 'client';
    const isOwner = isClient && project.client_id === userProfile?.id;
    const isBuilder = userProfile?.role === 'builder';
    const hasApplied = applications.some(app => app.builder_id === userProfile?.id);
    const myApplication = applications.find(app => app.builder_id === userProfile?.id);

    return (
        <div className="max-w-4xl space-y-6">
            <Link to="/dashboard/projects">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Projects
                </Button>
            </Link>

            <Card variant="glass" padding="lg">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <h1 className="text-3xl font-bold">{project.title}</h1>
                            <Badge
                                variant={
                                    project.status === 'open'
                                        ? 'success'
                                        : project.status === 'in_progress'
                                            ? 'info'
                                            : 'default'
                                }
                            >
                                {project.status.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Posted {new Date(project.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                ${project.budget_min.toLocaleString()} - $
                                {project.budget_max.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Apply Button Logic */}
                    {isBuilder && !hasApplied && project.status === 'open' && (
                        <Button variant="primary" onClick={() => setShowApplyForm(!showApplyForm)}>
                            {showApplyForm ? 'Cancel' : 'Apply for Project'}
                        </Button>
                    )}

                    {isBuilder && hasApplied && (
                        <Badge variant={myApplication?.status === 'accepted' ? 'success' : 'info'} size="lg">
                            Application {myApplication?.status}
                        </Badge>
                    )}

                    {isOwner && (
                        <Badge variant="default">You Own This</Badge>
                    )}
                </div>

                {/* Apply Form */}
                {showApplyForm && (
                    <div className="mb-6 p-6 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] animate-fade-in">
                        <h3 className="text-lg font-bold mb-4">Submit Proposal</h3>
                        <form onSubmit={handleApply}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Cover Letter</label>
                                <textarea
                                    className="w-full p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none min-h-[150px]"
                                    placeholder="Explain why you are the best fit for this project..."
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => setShowApplyForm(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" loading={applying}>
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Application
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-bold mb-3">Description</h2>
                        <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
                            {project.description}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold mb-3">Tech Stack</h2>
                        <div className="flex flex-wrap gap-2">
                            {project.stack.map((tech) => (
                                <Badge key={tech}>{tech}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Applications List (For Owner Only) */}
            {isOwner && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Applications ({applications.length})</h2>
                    {applications.length === 0 ? (
                        <Card variant="glass" padding="lg">
                            <p className="text-[var(--text-muted)] text-center">No applications yet.</p>
                        </Card>
                    ) : (
                        applications.map((app) => (
                            <Card key={app.id} variant="glass" className="hover:border-[var(--accent-primary)] transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white font-bold text-lg">
                                            {app.profiles?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg">{app.profiles?.name}</h3>
                                                <Badge variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'error' : 'default'}>
                                                    {app.status}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-2 mt-1">
                                                {app.profiles?.skills?.slice(0, 3).map(skill => (
                                                    <Badge key={skill} size="sm" variant="default" className="text-xs">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <p className="mt-3 text-[var(--text-secondary)] whitespace-pre-wrap">
                                                {app.cover_letter}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {app.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button variant="danger" size="sm" onClick={() => handleUpdateStatus(app.id, 'rejected')}>
                                                Reject
                                            </Button>
                                            <Button variant="primary" size="sm" onClick={() => handleUpdateStatus(app.id, 'accepted')}>
                                                Accept
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
