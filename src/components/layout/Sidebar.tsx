import { FileText } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Home, Briefcase, Users, MessageSquare, User, Shield, Code2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import clsx from 'clsx';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
    { name: 'Proposals', href: '/dashboard/proposals', icon: FileText, role: 'builder' },
    { name: 'Builders', href: '/dashboard/builders', icon: Users },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function Sidebar() {
    const { profile } = useAuthStore();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                        <Code2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold gradient-text">BuilderNet</h1>
                        <p className="text-xs text-[var(--text-muted)]">Premium Network</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => {
                    // Filter by role if specified
                    if ((item as any).role && (item as any).role !== profile?.role) {
                        return null;
                    }

                    return (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            end={item.href === '/dashboard'}
                            className={({ isActive }) =>
                                clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                                    isActive
                                        ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-lg'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={clsx('w-5 h-5', isActive && 'animate-pulse')} />
                                    <span className="font-medium">{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}

                {/* Admin Link - Only for admins */}
                {profile?.role === 'admin' && (
                    <NavLink
                        to="/dashboard/admin"
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                                isActive
                                    ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-lg'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                            )
                        }
                    >
                        <Shield className="w-5 h-5" />
                        <span className="font-medium">Admin</span>
                    </NavLink>
                )}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white font-bold">
                        {profile?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {profile?.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] capitalize">
                            {profile?.role}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
