import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

// Layouts
import AppShell from '../components/layout/AppShell';

// Pages
import Landing from '../app/landing/Landing';
import Login from '../app/auth/Login';
import Signup from '../app/auth/Signup';
import Onboarding from '../app/onboarding/Onboarding';
import Dashboard from '../app/dashboard/Dashboard';
import Profile from '../app/dashboard/profile/Profile';
import Projects from '../app/dashboard/projects/Projects';
import CreateProject from '../app/dashboard/projects/CreateProject';
import ProjectDetail from '../app/dashboard/projects/ProjectDetail';
import Proposals from '../app/dashboard/proposals/Proposals';
import Messages from '../app/dashboard/messages/Messages';
import Builders from '../app/dashboard/builders/Builders';
import Admin from '../app/dashboard/admin/Admin';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
                <div className="animate-pulse text-[var(--text-secondary)]">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

// Public Only Route (redirect if authenticated)
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
                <div className="animate-pulse text-[var(--text-secondary)]">Loading...</div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Landing />,
    },
    {
        path: '/login',
        element: (
            <PublicOnlyRoute>
                <Login />
            </PublicOnlyRoute>
        ),
    },
    {
        path: '/signup',
        element: (
            <PublicOnlyRoute>
                <Signup />
            </PublicOnlyRoute>
        ),
    },
    {
        path: '/onboarding',
        element: (
            <ProtectedRoute>
                <Onboarding />
            </ProtectedRoute>
        ),
    },
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute>
                <AppShell />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
            {
                path: 'profile',
                element: <Profile />,
            },
            {
                path: 'profile/:id',
                element: <Profile />,
            },
            {
                path: 'projects',
                element: <Projects />,
            },
            {
                path: 'projects/new',
                element: <CreateProject />,
            },
            {
                path: 'projects/:id',
                element: <ProjectDetail />,
            },
            {
                path: 'proposals',
                element: <Proposals />,
            },
            {
                path: 'builders',
                element: <Builders />,
            },
            {
                path: 'messages',
                element: <Messages />,
            },
            {
                path: 'admin',
                element: <Admin />,
            },
        ],
    },
]);
