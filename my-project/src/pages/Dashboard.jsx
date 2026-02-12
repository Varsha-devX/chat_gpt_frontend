import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalInteractions: 0,
        totalConversations: 0,
        activePlan: 'Free',
        recentActivity: []
    });

    useEffect(() => {
        // Auth check
        const token = localStorage.getItem('access_token');
        const userId = localStorage.getItem('user_id');
        if (!token) {
            navigate('/login');
            return;
        } else {
            const savedEmail = localStorage.getItem('user_email');
            setUser({ email: savedEmail || 'user@example.com', name: savedEmail ? savedEmail.split('@')[0] : 'Premium User' });
        }

        const fetchData = async () => {
            // Load base data
            const totalSent = localStorage.getItem('total_messages_sent') || '0';
            const plan = localStorage.getItem('user_plan') || 'Free';
            let activity = JSON.parse(localStorage.getItem('recent_activity') || '[]');
            let totalConvs = parseInt(localStorage.getItem('total_conversations') || '0');

            if (userId) {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/history/${userId}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.messages && data.messages.length > 0) {
                            // Extract user queries as recent activity
                            activity = data.messages
                                .filter(m => m.role === 'user')
                                .reverse()
                                .slice(0, 10)
                                .map((m, idx) => ({
                                    id: `db-${idx}`,
                                    title: m.content.substring(0, 35) + (m.content.length > 35 ? "..." : ""),
                                    time: m.timestamp ? m.timestamp.split(' ')[1] : 'Recent'
                                }));
                            totalConvs = data.messages.filter(m => m.role === 'user').length;
                        }
                    }
                } catch (error) {
                    console.error("Fetch error:", error);
                }
            }

            setStats({
                totalInteractions: parseInt(totalSent),
                totalConversations: totalConvs,
                activePlan: plan,
                recentActivity: activity
            });
        };

        fetchData();
    }, [navigate]);

    const handleSignout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_id');
        navigate('/login');
    };



    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="md:flex md:items-center md:justify-between mb-10">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl tracking-tight">
                            Welcome back, {user?.name || 'User'}!
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 font-medium uppercase tracking-widest">
                            {stats.activePlan} Account Dashboard
                        </p>
                    </div>
                    <div className="mt-6 flex md:mt-0 md:ml-4">
                        <button
                            onClick={handleSignout}
                            className="inline-flex items-center px-6 py-3 border border-white/10 rounded-xl shadow-lg text-sm font-bold text-white bg-red-600/20 hover:bg-red-600/30 transition duration-300 backdrop-blur-sm"
                        >
                            Sign out
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                    <div className="bg-[#212121] overflow-hidden shadow-2xl rounded-3xl border border-white/5 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-indigo-600 rounded-2xl p-4 shadow-indigo-500/20 shadow-xl">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Messages</p>
                                <p className="text-2xl font-black text-white mt-1">{stats.totalInteractions.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#212121] overflow-hidden shadow-2xl rounded-3xl border border-white/5 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-emerald-600 rounded-2xl p-4 shadow-emerald-500/20 shadow-xl">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total History</p>
                                <p className="text-2xl font-black text-white mt-1">{stats.totalConversations}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#212121] overflow-hidden shadow-2xl rounded-3xl border border-white/5 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-600 rounded-2xl p-4 shadow-purple-500/20 shadow-xl">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Plan Status</p>
                                <p className="text-2xl font-black text-emerald-400 mt-1">{stats.activePlan}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Table */}
                <div className="bg-[#212121] shadow-2xl rounded-3xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className="text-lg font-black tracking-tight">Recent Conversation History</h3>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-tighter bg-indigo-500/10 px-3 py-1 rounded-full">Automated Backup</span>
                    </div>
                    <div className="p-0">
                        {stats.recentActivity.length === 0 ? (
                            <div className="py-20 text-center">
                                <svg className="mx-auto h-16 w-16 text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 00-2 2H6a2 2 0 00-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <h3 className="text-xl font-bold text-gray-400">Silence is Empty</h3>
                                <p className="mt-2 text-sm text-gray-600 max-w-xs mx-auto">Start a conversation to see your history populated here.</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-black bg-white hover:bg-gray-200 transition-all shadow-xl active:scale-95"
                                >
                                    Start Chatting
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-white/5">
                                    <thead className="bg-[#1a1a1a]">
                                        <tr>
                                            <th className="px-8 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest leading-none">Topic / Query</th>
                                            <th className="px-8 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-widest leading-none">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {stats.recentActivity.map((item) => (
                                            <tr key={item.id} className="hover:bg-white/5 transition-colors group cursor-default">
                                                <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        {item.title}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 text-right font-medium">
                                                    {item.time}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;