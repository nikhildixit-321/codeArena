import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Lock, Eye, Volume2, Globe, Shield, Trash2, Save } from 'lucide-react';
import MainLayout from '../../components/MainLayout';
import HomeNavbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const Settings = () => {
    const { user, checkUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Local state for settings
    const [settings, setSettings] = useState({
        notifications: user?.settings?.notifications ?? true,
        publicProfile: user?.settings?.publicProfile ?? true,
        soundEffects: user?.settings?.soundEffects ?? true,
        language: user?.settings?.language ?? 'English',
        leetcodeHandle: user?.settings?.leetcodeHandle ?? '',
        codeforcesHandle: user?.settings?.codeforcesHandle ?? ''
    });

    useEffect(() => {
        if (user?.settings) {
            setSettings({
                notifications: user.settings.notifications,
                publicProfile: user.settings.publicProfile,
                soundEffects: user.settings.soundEffects,
                language: user.settings.language,
                leetcodeHandle: user.settings.leetcodeHandle || '',
                codeforcesHandle: user.settings.codeforcesHandle || '',
                leetcodeSession: user.settings.leetcodeSession || '',
                autoSubmitEnabled: user.settings.autoSubmitEnabled || false
            });
        }
    }, [user]);

    const saveSettings = async (newSettings) => {
        try {
            const res = await api.post('/auth/settings', { settings: newSettings });
            checkUser(); // Refresh user context
            return res.data;
        } catch (err) {
            console.error("Failed to save settings:", err);
            setMessage({ type: 'error', text: 'Failed to save settings' });
        }
    };

    const handleToggle = async (key) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        await saveSettings(newSettings);
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you absolutely sure? This action cannot be undone and all your progress will be lost.")) return;

        try {
            await api.delete('/auth/account');
            window.location.href = '/login';
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete account' });
        }
    };

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [showHelp, setShowHelp] = useState(false);
    const [activeSection, setActiveSection] = useState('General');

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout navbar={<HomeNavbar />}>
            <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-sky-500/10 rounded-lg text-sky-500">
                            <SettingsIcon size={24} />
                        </div>
                        <h1 className="text-3xl font-bold">Settings</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Sidebar Navigation */}
                        <div className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                            {['General', 'Accounts', 'Security', 'Privacy'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`whitespace-nowrap md:w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${activeSection === tab ? 'bg-sky-500/10 text-sky-400' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                                    onClick={() => setActiveSection(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Settings Content */}
                        <div className="md:col-span-2 space-y-8">
                            {message.text && (
                                <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    {message.text}
                                </div>
                            )}

                            {/* Account Section */}
                            {activeSection === 'General' && (
                                <section className="bg-[#111114] border border-white/10 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="p-6 border-b border-white/5 bg-white/2">
                                        <h2 className="text-lg font-bold flex items-center gap-2">
                                            <Globe size={18} className="text-sky-400" />
                                            Account Preferences
                                        </h2>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <ToggleSetting
                                            icon={Eye}
                                            title="Public Profile"
                                            desc="Allow others to see your stats and match history."
                                            active={settings.publicProfile}
                                            onToggle={() => handleToggle('publicProfile')}
                                        />
                                        <ToggleSetting
                                            icon={Bell}
                                            title="Push Notifications"
                                            desc="Receive alerts for friend requests and match invites."
                                            active={settings.notifications}
                                            onToggle={() => handleToggle('notifications')}
                                        />
                                        <ToggleSetting
                                            icon={Volume2}
                                            title="Sound Effects"
                                            desc="Play sounds for notifications and game actions."
                                            active={settings.soundEffects}
                                            onToggle={() => handleToggle('soundEffects')}
                                        />
                                    </div>
                                </section>
                            )}

                            {/* Linked Accounts Section */}
                            {activeSection === 'Accounts' && (
                                <section className="bg-[#111114] border border-white/10 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="p-6 border-b border-white/5 bg-white/2">
                                        <h2 className="text-lg font-bold flex items-center gap-2">
                                            <Shield size={18} className="text-sky-400" />
                                            Linked Platforms
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1">Connect your accounts for auto-sync and cross-platform rewards.</p>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">LeetCode Username</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={settings.leetcodeHandle}
                                                    onChange={(e) => setSettings({ ...settings, leetcodeHandle: e.target.value })}
                                                    placeholder="e.g., nikhildixit"
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-sky-500/50 outline-none transition-all"
                                                />
                                                <button
                                                    onClick={() => saveSettings(settings)}
                                                    className="px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-xl text-xs font-bold transition-all"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Codeforces Handle</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={settings.codeforcesHandle}
                                                    onChange={(e) => setSettings({ ...settings, codeforcesHandle: e.target.value })}
                                                    placeholder="e.g., nikhildixit"
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-sky-500/50 outline-none transition-all"
                                                />
                                                <button
                                                    onClick={() => saveSettings(settings)}
                                                    className="px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-xl text-xs font-bold transition-all"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                        <div className="h-px bg-white/5 my-4"></div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-bold text-white">Auto-Submit to LeetCode</h4>
                                                    <p className="text-[10px] text-gray-500">Automatically push solved match results to your LeetCode profile.</p>
                                                </div>
                                                <button
                                                    onClick={() => handleToggle('autoSubmitEnabled')}
                                                    className={`w-10 h-5 rounded-full relative transition-all ${settings.autoSubmitEnabled ? 'bg-sky-500' : 'bg-white/10'}`}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.autoSubmitEnabled ? 'left-6' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            {settings.autoSubmitEnabled && (
                                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">LeetCode Session Cookie</label>
                                                        <button
                                                            onClick={() => setShowHelp(!showHelp)}
                                                            className="text-[10px] text-sky-400 font-bold hover:underline"
                                                        >
                                                            {showHelp ? 'Hide Guide' : 'How to find it?'}
                                                        </button>
                                                    </div>

                                                    {showHelp && (
                                                        <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl space-y-3 animate-in zoom-in-95 duration-200">
                                                            <h5 className="text-xs font-bold text-sky-400">Quick Guide:</h5>
                                                            <ul className="text-[10px] text-gray-400 space-y-2 list-decimal ml-4 font-medium">
                                                                <li>Login to <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="text-white hover:underline">leetcode.com</a>.</li>
                                                                <li>Press <span className="bg-white/10 px-1 rounded text-white font-mono text-[9px]">F12</span> or <span className="text-white">Inspect</span>.</li>
                                                                <li>Go to <span className="text-white font-bold text-[9px]">Application</span> {'>'} <span className="text-white font-bold text-[9px]">Cookies</span>.</li>
                                                                <li>Copy the value of <span className="text-sky-400 font-bold text-[9px]">LEETCODE_SESSION</span>.</li>
                                                            </ul>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="password"
                                                        value={settings.leetcodeSession}
                                                        onChange={(e) => setSettings({ ...settings, leetcodeSession: e.target.value })}
                                                        placeholder="Paste LEETCODE_SESSION value here..."
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-sky-500/50 outline-none transition-all"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Security Section */}
                            {activeSection === 'Security' && (
                                <section className="bg-[#111114] border border-white/10 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="p-6 border-b border-white/5 bg-white/2">
                                        <h2 className="text-lg font-bold flex items-center gap-2">
                                            <Lock size={18} className="text-orange-500" />
                                            Security
                                        </h2>
                                    </div>
                                    <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Current Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-sky-500/50"
                                                placeholder="Enter current password"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">New Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwords.new}
                                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-sky-500/50"
                                                    placeholder="Min. 6 characters"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Confirm Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwords.confirm}
                                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-sky-500/50"
                                                    placeholder="Repeat new password"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full md:w-auto px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading ? 'Changing...' : (
                                                <>
                                                    <Save size={18} />
                                                    Update Password
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </section>
                            )}

                            {/* Danger Zone */}
                            {activeSection === 'Privacy' && (
                                <section className="bg-red-500/5 border border-red-500/20 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="p-6">
                                        <h2 className="text-lg font-bold text-red-500 flex items-center gap-2 mb-2">
                                            <Trash2 size={18} />
                                            Danger Zone
                                        </h2>
                                        <p className="text-sm text-gray-500 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                                        <button
                                            onClick={handleDeleteAccount}
                                            className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl border border-red-500/30 transition-all font-mono uppercase text-xs"
                                        >
                                            Delete My Account Permanently
                                        </button>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

const ToggleSetting = ({ icon: Icon, title, desc, active, onToggle }) => (
    <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                <Icon size={20} />
            </div>
            <div>
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="text-xs text-gray-500">{desc}</p>
            </div>
        </div>
        <button
            onClick={onToggle}
            className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-sky-500' : 'bg-white/10'}`}
        >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? 'left-7' : 'left-1'}`} />
        </button>
    </div>
);

export default Settings;
