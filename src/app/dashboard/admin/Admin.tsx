import { Shield } from 'lucide-react';
import Card from '../../../components/ui/Card';

export default function Admin() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-[var(--accent-primary)]" />
                <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card variant="glass">
                    <h3 className="text-lg font-bold mb-2">Total Users</h3>
                    <p className="text-3xl font-bold gradient-text">1,234</p>
                </Card>
                <Card variant="glass">
                    <h3 className="text-lg font-bold mb-2">Pending Verifications</h3>
                    <p className="text-3xl font-bold gradient-text">42</p>
                </Card>
                <Card variant="glass">
                    <h3 className="text-lg font-bold mb-2">Active Projects</h3>
                    <p className="text-3xl font-bold gradient-text">156</p>
                </Card>
            </div>

            <Card variant="glass" padding="lg">
                <h2 className="text-xl font-bold mb-4">Pending Verifications</h2>
                <p className="text-[var(--text-muted)]">
                    Builder verification management coming soon...
                </p>
            </Card>
        </div>
    );
}
