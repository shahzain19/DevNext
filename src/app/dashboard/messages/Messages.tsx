import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, MoreVertical, Image as ImageIcon, Paperclip, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuthStore } from '../../../store/useAuthStore';
import { getConversations, getConversationMessages, sendMessage, subscribeToConversation, uploadMessageAttachment } from '../../../lib/db';
import type { Message, Conversation, Profile } from '../../../lib/supabase';

export default function Messages() {
    const { profile } = useAuthStore();
    const [searchParams] = useSearchParams();
    const activeConvId = searchParams.get('conversation');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Load
    useEffect(() => {
        loadConversations();
    }, [activeConvId]);

    // Active Conversation Logic
    useEffect(() => {
        if (activeConversation) {
            loadMessages(activeConversation.id);

            // Subscribe to real-time updates
            const sub = subscribeToConversation(activeConversation.id, (msg) => {
                // Only add if we don't already have it (optimistic update check)
                setMessages((prev) => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                scrollToBottom();
            });

            return () => {
                sub.then(s => s.unsubscribe());
            };
        }
    }, [activeConversation]);

    const scrollToBottom = () => {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    };

    const loadConversations = async () => {
        try {
            const data = await getConversations();
            setConversations(data);

            if (activeConvId) {
                const target = data.find(c => c.id === activeConvId);
                if (target) {
                    setActiveConversation(target);
                    // On mobile, close sidebar when conversation is selected via URL
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                }
            } else if (data.length > 0 && !activeConversation) {
                setActiveConversation(data[0]);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (id: string) => {
        try {
            const data = await getConversationMessages(id);
            setMessages(data);
            scrollToBottom();
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim()) || !activeConversation || !profile) return;

        const contentToSend = newMessage;
        setNewMessage(''); // Clear input immediately

        // 1. Optimistic Update
        const optimisticMsg: Message = {
            id: `temp-${Date.now()}`,
            conversation_id: activeConversation.id,
            sender_id: profile.id,
            receiver_id: activeConversation.other_user?.id,
            content: contentToSend,
            read: false,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMsg]);
        scrollToBottom();

        // 2. Network Request
        try {
            const sentMsg = await sendMessage({
                conversation_id: activeConversation.id,
                sender_id: profile.id,
                receiver_id: activeConversation.other_user?.id,
                content: contentToSend,
                read: false
            });

            // 3. Replace Optimistic Message
            setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? sentMsg : m));
        } catch (error) {
            console.error('Failed to send message:', error);
            // Remove optimistic message on failure
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
            alert('Failed to send message');
            setNewMessage(contentToSend); // Restore text
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !activeConversation || !profile) return;
        const file = e.target.files[0];
        setIsUploading(true);

        try {
            const publicUrl = await uploadMessageAttachment(profile.id, file);
            // Append markdown image syntax to input
            setNewMessage(prev => prev + `\n![Image](${publicUrl})\n`);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    if (loading) return <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">Loading conversations...</div>;

    return (
        <div className="h-[calc(100vh-140px)] flex overflow-hidden rounded-2xl bg-white/50 border border-[var(--border-color)] relative">

            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'w-full md:w-80' : 'w-0'} bg-white/80 backdrop-blur-md border-r border-[var(--border-color)] flex flex-col transition-all duration-300 ease-in-out absolute md:relative z-20 h-full`}>
                <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
                    <h2 className="font-bold text-lg">Messages</h2>
                    <Button variant="ghost" size="sm" onClick={toggleSidebar} className="md:hidden">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-[var(--text-muted)]">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No conversations yet</p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => {
                                    setActiveConversation(conv);
                                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                                }}
                                className={`w-full p-4 flex items-center gap-3 hover:bg-[var(--bg-tertiary)] transition-colors border-b border-[var(--border-color)] text-left ${activeConversation?.id === conv.id ? 'bg-[var(--bg-tertiary)] border-l-4 border-l-[var(--accent-primary)]' : ''}`}
                            >
                                <Avatar profile={conv.other_user} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-semibold truncate text-[var(--text-primary)]">{conv.other_user?.name || 'Unknown'}</h4>
                                        <span className="text-xs text-[var(--text-muted)]">
                                            {new Date(conv.last_message_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)] truncate">
                                        View conversation
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-[var(--bg-secondary)]/30 min-w-0">
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-[var(--border-color)] flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                {!isSidebarOpen && (
                                    <Button variant="ghost" size="sm" onClick={toggleSidebar} className="mr-1">
                                        <Menu className="w-5 h-5" />
                                    </Button>
                                )}
                                <Avatar profile={activeConversation.other_user} size="sm" />
                                <div>
                                    <h3 className="font-bold leading-tight">{activeConversation.other_user?.name}</h3>
                                    <p className="text-xs text-[var(--text-muted)] capitalize">{activeConversation.other_user?.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                            </div>
                        </div>

                        {/* Messages Feed */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                            {messages.map((msg) => {
                                const isMe = msg.sender_id === profile?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                        <div className={`max-w-[85%] md:max-w-[70%]`}>
                                            <div className={`px-4 py-3 rounded-2xl shadow-sm ${isMe
                                                    ? 'bg-[var(--accent-primary)] text-white rounded-br-none'
                                                    : 'bg-white border border-[var(--border-color)] rounded-bl-none text-[var(--text-primary)]'
                                                }`}>
                                                <div className={`prose prose-sm max-w-none ${isMe ? 'prose-invert' : ''}`}>
                                                    <ReactMarkdown
                                                        components={{
                                                            img: ({ node, ...props }) => (
                                                                <img {...props} className="rounded-lg max-h-60 object-cover my-2 border border-black/10" />
                                                            ),
                                                            a: ({ node, ...props }) => (
                                                                <a {...props} className="underline font-bold" target="_blank" rel="noopener noreferrer" />
                                                            )
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] mt-1 block px-1 ${isMe ? 'text-right text-[var(--text-muted)]' : 'text-left text-[var(--text-muted)]'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-[var(--border-color)]">
                            <form onSubmit={handleSend} className="flex gap-2 items-end">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="rounded-full w-10 h-10 p-0 text-[var(--text-secondary)]"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    {isUploading ? <div className="w-4 h-4 border-2 border-[var(--text-muted)] border-t-transparent rounded-full animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                                </Button>

                                <div className="flex-1 relative">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend(e);
                                            }
                                        }}
                                        placeholder="Type a message... (Markdown supported)"
                                        className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] bg-[var(--bg-tertiary)] resize-none max-h-32 text-sm"
                                        rows={1}
                                        style={{ minHeight: '46px' }}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={!newMessage.trim()}
                                    className="rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)]">
                        <div className="w-24 h-24 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="w-10 h-10 opacity-30" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Your Messages</h3>
                        <p className="max-w-xs text-center">Select a conversation from the sidebar to start chatting.</p>
                        {!isSidebarOpen && (
                            <Button variant="outline" className="mt-6" onClick={toggleSidebar}>
                                Open Conversations
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-component for Avatar to keep main component clean
function Avatar({ profile, size = 'md' }: { profile?: Profile | any, size?: 'sm' | 'md' }) {
    const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-12 h-12 text-lg';

    // Deterministic gradient fallback
    const getGradient = (name: string) => {
        const colors = [
            'from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500',
            'from-orange-400 to-pink-500', 'from-purple-400 to-indigo-500'
        ];
        return colors[name ? name.length % colors.length : 0];
    };

    return (
        <div className={`${sizeClasses} rounded-full bg-gradient-to-br ${getGradient(profile?.name || '')} flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden shadow-inner`}>
            {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
                (profile?.name?.charAt(0) || '?').toUpperCase()
            )}
        </div>
    );
}
