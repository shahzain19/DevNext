import { useEffect, useState } from 'react';
import { Search, MapPin, DollarSign, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import { getVerifiedBuilders } from '../../../lib/db';
import type { Profile } from '../../../lib/supabase';

export default function Builders() {
    const [builders, setBuilders] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadBuilders();
    }, []);

    const loadBuilders = async () => {
        try {
            const data = await getVerifiedBuilders();
            setBuilders(data);
        } catch (error) {
            console.error('Error loading builders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBuilders = builders.filter((builder) =>
        builder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        builder.skills.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Find Builders</h1>
            </div>

            {/* Search */}
            <Input
                type="text"
                placeholder="Search by name or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5" />}
            />

            {/* Builders Grid */}
            {loading ? (
                <div className="text-center py-12 text-[var(--text-muted)]">
                    Loading builders...
                </div>
            ) : filteredBuilders.length === 0 ? (
                <Card variant="glass" padding="lg">
                    <div className="text-center py-12">
                        <h3 className="text-xl font-bold mb-2">No builders found</h3>
                        <p className="text-[var(--text-secondary)]">
                            Try adjusting your search criteria
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {filteredBuilders.map((builder) => (
                        <Card key={builder.id} variant="glass" hover>
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                    {builder.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold truncate">{builder.name}</h3>
                                        {builder.verification === 'approved' && (
                                            <Badge variant="success" size="sm">
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                    {builder.bio && (
                                        <p className="text-[var(--text-secondary)] text-sm mb-3 line-clamp-2">
                                            {builder.bio}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {builder.skills.slice(0, 4).map((skill) => (
                                            <Badge key={skill} size="sm">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {builder.skills.length > 4 && (
                                            <Badge size="sm">+{builder.skills.length - 4}</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                                        {builder.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {builder.location}
                                            </div>
                                        )}
                                        {builder.hourly_rate && (
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                ${builder.hourly_rate}/hr
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                                <Link to={`/dashboard/profile/${builder.id}`} className="block w-full">
                                    <Button variant="outline" size="sm" fullWidth>
                                        View Profile
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
