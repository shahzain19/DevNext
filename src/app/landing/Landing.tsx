import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Shield, Zap, CheckCircle2, Globe2 } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function Landing() {
    return (
        <div className="min-h-screen bg-white relative overflow-hidden selection:bg-[var(--accent-primary)] selection:text-white font-[var(--font-heading)]">

            {/* Subtle Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-[800px] pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[100%] rounded-full bg-blue-100/50 blur-[100px] opacity-40 animate-pulse-slow" />
                <div className="absolute top-[10%] -right-[10%] w-[40%] h-[80%] rounded-full bg-purple-100/50 blur-[120px] opacity-40 animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Code2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">BuilderNet</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
                            Log in
                        </Link>
                        <Link to="/signup">
                            <Button variant="primary" className="rounded-full px-6 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-32 px-6 z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 mb-8 animate-fade-in-up hover:border-blue-200 transition-colors cursor-default">
                        <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">The Premium Network</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Build with the <br className="hidden md:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">World's Best</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-12 font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Access an exclusive collective of verified software engineers.
                        Top 1% talent, ready to ship your vision.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Link to="/signup" className="w-full sm:w-auto">
                            <Button size="lg" className="rounded-full w-full sm:w-auto h-14 px-8 text-lg shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 hover:scale-105 transition-all duration-300 bg-slate-900 hover:bg-slate-800 text-white border-none">
                                Join the Network
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link to="/dashboard" className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="rounded-full w-full sm:w-auto h-14 px-8 text-lg border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700">
                                View Projects
                            </Button>
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-60 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-slate-400" />
                            <span className="font-semibold text-slate-600">Rigorous Vetting</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-slate-400" />
                            <span className="font-semibold text-slate-600">Escrow Payments</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-slate-400" />
                            <span className="font-semibold text-slate-600">Zero-Risk Matches</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-32 px-6 bg-slate-50/50 border-t border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-100 transition-all duration-500 group">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                <Shield className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Vetted Excellence</h3>
                            <p className="text-slate-500 leading-relaxed">
                                We manually verify every builder's code, identity, and experience.
                                Only the top tier makes it in.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-purple-500/5 hover:border-purple-100 transition-all duration-500 group">
                            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                <Zap className="w-7 h-7 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Instant Matches</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Our intelligent matching system pairs you with builders who have
                                the exact stack and domain expertise you need.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-100 transition-all duration-500 group">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                <Globe2 className="w-7 h-7 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Global Network</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Tap into a borderless pool of talent. Collaboration tools built-in
                                to make remote work feel seamless.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Minimal CTA */}
            <section className="py-32 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">
                        Ready to build the extraordinary?
                    </h2>
                    <Link to="/signup">
                        <div className="group relative inline-flex items-center justify-center">
                            <div className="absolute transition-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-full blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
                            <button className="relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-200 bg-slate-900 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
                                Start Your Journey
                            </button>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-12 border-t border-slate-100 bg-white">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-slate-400 font-medium">© 2026 BuilderNet Inc.</p>
                </div>
            </footer>
        </div>
    );
}
