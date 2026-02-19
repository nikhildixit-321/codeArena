/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HomeNavbar from '../../components/Navbar';
import MainLayout from '../../components/MainLayout';
import api from '../../api/axios';
import {
  User, Mail, Lock, Trophy, History, Edit2, Camera,
  Save, X, ChevronLeft, Gamepad2, Target, Flame,
  Medal, Clock, CheckCircle, Award
} from 'lucide-react';

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'from-blue-600 to-blue-800',
    green: 'from-green-600 to-green-800',
    yellow: 'from-yellow-600 to-yellow-800',
    orange: 'from-orange-600 to-orange-800',
    purple: 'from-purple-600 to-purple-800',
  };

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-4 text-white shadow-lg`}>
        <Icon size={24} />
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
};

const Profile = () => {
  const { user, checkUser } = useAuth();
  // ... (keep state logic same as before, simplified for brevity in this view, but fully implemented in file)
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Profile data
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    avatar: '',
    bio: ''
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Mock game history (in a real app, fetch from API)
  const [gameHistory] = useState([
    { id: 1, opponent: 'Player_123', result: 'win', score: '2-0', date: '2026-02-10', rating: 1250 },
    { id: 2, opponent: 'Coder_X', result: 'loss', score: '0-2', date: '2026-02-09', rating: 1230 },
    { id: 3, opponent: 'Dev_Master', result: 'win', score: '2-1', date: '2026-02-08', rating: 1245 },
    { id: 4, opponent: 'Algo_King', result: 'win', score: '2-0', date: '2026-02-07', rating: 1220 },
    { id: 5, opponent: 'Bug_Hunter', result: 'loss', score: '1-2', date: '2026-02-06', rating: 1205 },
  ]);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        avatar: user.avatar || '',
        bio: user.bio || 'Competitive programmer passionate about algorithms.'
      });
    }
  }, [user]);

  // Handler functions
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await api.put('/auth/profile', profileData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      checkUser();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileData(prev => ({ ...prev, avatar: res.data.avatarUrl }));
      setMessage('Avatar updated!');
      checkUser();
    } catch (err) {
      setMessage('Failed to upload avatar');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  // Calculate dynamic stats from user object if available
  const stats = {
    totalMatches: user.matchesPlayed || 48,
    wins: user.matchesWon || 32,
    losses: (user.matchesPlayed || 48) - (user.matchesWon || 32),
    winRate: user.matchesPlayed ? `${Math.round((user.matchesWon / user.matchesPlayed) * 100)}%` : '67%',
    currentRating: user.rating || 1200,
    highestRating: user.highestRating || 1320, // Assuming this field might exist later
    streak: user.streak || 3
  };

  return (
    <MainLayout navbar={<HomeNavbar />}>
      <div className="min-h-full bg-background text-foreground pb-20">

        {/* Banner Section */}
        <div className="h-60 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-background to-transparent"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 sm:px-8 relative -mt-24">

          {/* Header Card */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-xl flex flex-col md:flex-row items-end md:items-center gap-6 mb-8">

            {/* Avatar */}
            <div className="relative group shrink-0">
              <div
                onClick={handleAvatarClick}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-secondary flex items-center justify-center cursor-pointer overflow-hidden shadow-2xl transition-transform group-hover:scale-105"
              >
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-muted-foreground" />
                )}
              </div>
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/90"
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 mb-2">
              <div className="flex items-center gap-4 mb-1">
                <h1 className="text-3xl font-bold">{profileData.username}</h1>
                <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold border border-yellow-500/20 flex items-center gap-1">
                  <Trophy size={12} /> Gold II
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Mail size={14} />
                <span>{profileData.email}</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                {profileData.bio}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 mb-4 md:mb-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors font-medium text-sm"
              >
                <Edit2 size={16} />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Message Alert */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${message.includes('success')
                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                : 'bg-destructive/10 text-destructive border-destructive/20'
              }`}>
              {message.includes('success') ? <CheckCircle size={20} /> : <X size={20} />}
              {message}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'history', label: 'Match History', icon: History },
              { id: 'edit', label: 'Settings', icon: Edit2 }, // Merged edit & password conceptually in UI, though kept separate logical blocks below
              { id: 'password', label: 'Security', icon: Lock },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMessage(''); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent'
                  }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Gamepad2} label="Matches Played" value={stats.totalMatches} color="blue" />
                <StatCard icon={Trophy} label="Total Wins" value={stats.wins} color="green" />
                <StatCard icon={Target} label="Win Rate" value={stats.winRate} color="yellow" />
                <StatCard icon={Flame} label="Current Streak" value={`${stats.streak} 🔥`} color="orange" />

                <div className="col-span-full mt-2">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Award className="text-purple-500" /> Recent Achievements
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: Medal, name: 'First Blood', desc: 'Win your first match', date: '2 days ago' },
                      { icon: Trophy, name: 'Climber', desc: 'Reach 1200 rating', date: '1 week ago' },
                      { icon: Flame, name: 'Hot Streak', desc: 'Win 3 matches in a row', date: 'Just now' },
                      { icon: CheckCircle, name: 'Solver', desc: 'Complete 10 daily challenges', date: 'Yesterday' },
                    ].map((ach, i) => (
                      <div key={i} className="bg-card p-4 rounded-xl border border-border hover:border-primary/50 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <ach.icon size={20} />
                        </div>
                        <div className="font-bold text-sm mb-1">{ach.name}</div>
                        <div className="text-xs text-muted-foreground mb-2">{ach.desc}</div>
                        <div className="text-[10px] text-muted-foreground/60 uppercase font-mono">{ach.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Edit Profile Tab */}
            {activeTab === 'edit' && (
              <div className="bg-card rounded-2xl p-6 border border-border max-w-2xl">
                <h3 className="text-lg font-bold mb-6">Personal Information</h3>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Username</label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 rounded-lg font-medium transition-colors"
                    >
                      <Save size={18} />
                      {loading ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-card rounded-2xl p-6 border border-border max-w-2xl">
                <h3 className="text-lg font-bold mb-6">Security Settings</h3>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 rounded-lg font-medium transition-colors"
                    >
                      <Lock size={18} />
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs font-bold">
                      <tr>
                        <th className="px-6 py-4">Result</th>
                        <th className="px-6 py-4">Opponent</th>
                        <th className="px-6 py-4">Score</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Rating Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {gameHistory.map((game, i) => (
                        <tr key={game.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-xs capitalize ${game.result === 'win'
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                : 'bg-destructive/10 text-destructive border border-destructive/20'
                              }`}>
                              {game.result === 'win' ? <Trophy size={12} /> : <X size={12} />}
                              {game.result}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                              {game.opponent[0]}
                            </div>
                            {game.opponent}
                          </td>
                          <td className="px-6 py-4 font-mono">{game.score}</td>
                          <td className="px-6 py-4 text-muted-foreground">{game.date}</td>
                          <td className={`px-6 py-4 text-right font-bold ${game.result === 'win' ? 'text-green-500' : 'text-destructive'
                            }`}>
                            {game.result === 'win' ? '+25' : '-25'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {gameHistory.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">No matches played yet.</div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
