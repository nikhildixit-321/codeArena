import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HomeNavbar from '../../components/Navbar';
import { 
  User, Mail, Lock, Trophy, History, Edit2, Camera, 
  Save, X, ChevronLeft, Gamepad2, Target, Flame,
  Medal, Clock, CheckCircle
} from 'lucide-react';
import api from '../../api/axios';

const Profile = () => {
  const { user, checkUser } = useAuth();
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

  // Mock game history
  const [gameHistory] = useState([
    { id: 1, opponent: 'Player_123', result: 'win', score: '2-0', date: '2026-02-10', rating: 1250 },
    { id: 2, opponent: 'Coder_X', result: 'loss', score: '0-2', date: '2026-02-09', rating: 1230 },
    { id: 3, opponent: 'Dev_Master', result: 'win', score: '2-1', date: '2026-02-08', rating: 1245 },
    { id: 4, opponent: 'Algo_King', result: 'win', score: '2-0', date: '2026-02-07', rating: 1220 },
    { id: 5, opponent: 'Bug_Hunter', result: 'loss', score: '1-2', date: '2026-02-06', rating: 1205 },
  ]);

  // Stats
  const stats = {
    totalMatches: 48,
    wins: 32,
    losses: 16,
    winRate: '67%',
    currentRating: 1250,
    highestRating: 1320,
    streak: 3
  };

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <HomeNavbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        {/* Profile Header */}
        <div className="bg-slate-900 rounded-2xl p-8 mb-8 border border-slate-800">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div 
                onClick={handleAvatarClick}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
              >
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-white" />
                )}
              </div>
              <button 
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-700"
              >
                <Camera size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{profileData.username}</h1>
              <p className="text-slate-400 mb-4">{profileData.email}</p>
              <p className="text-slate-500 text-sm max-w-md">{profileData.bio}</p>
              
              <div className="flex gap-4 mt-6 justify-center md:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{stats.currentRating}</div>
                  <div className="text-xs text-slate-500">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.wins}</div>
                  <div className="text-xs text-slate-500">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.winRate}</div>
                  <div className="text-xs text-slate-500">Win Rate</div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Edit2 size={16} />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-600/20 text-green-400 border border-green-600/30' : 'bg-red-600/20 text-red-400 border border-red-600/30'}`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'edit', label: 'Edit Profile', icon: Edit2 },
            { id: 'password', label: 'Password', icon: Lock },
            { id: 'history', label: 'Game History', icon: History },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={Gamepad2} label="Total Matches" value={stats.totalMatches} color="blue" />
              <StatCard icon={Trophy} label="Wins" value={stats.wins} color="green" />
              <StatCard icon={Target} label="Win Rate" value={stats.winRate} color="yellow" />
              <StatCard icon={Flame} label="Current Streak" value={`${stats.streak} 🔥`} color="orange" />
              
              <div className="col-span-full mt-6">
                <h3 className="text-lg font-semibold mb-4">Achievements</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Medal, name: 'First Win', desc: 'Win your first match' },
                    { icon: Trophy, name: 'Champion', desc: 'Reach 1300 rating' },
                    { icon: Flame, name: 'On Fire', desc: 'Win 5 matches in a row' },
                    { icon: CheckCircle, name: 'Problem Solver', desc: 'Solve 50 problems' },
                  ].map((ach, i) => (
                    <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                      <ach.icon className="text-purple-400 mb-2" size={24} />
                      <div className="font-medium text-sm">{ach.name}</div>
                      <div className="text-xs text-slate-500">{ach.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Edit Profile Tab */}
          {activeTab === 'edit' && (
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-medium"
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-medium"
              >
                <Lock size={16} />
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          )}

          {/* Game History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {gameHistory.map(game => (
                <div key={game.id} className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      game.result === 'win' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                    }`}>
                      {game.result === 'win' ? <Trophy size={18} /> : <X size={18} />}
                    </div>
                    <div>
                      <div className="font-medium">vs {game.opponent}</div>
                      <div className="text-sm text-slate-500">{game.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${game.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                      {game.result === 'win' ? 'Victory' : 'Defeat'}
                    </div>
                    <div className="text-sm text-slate-500">{game.score}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-4`}>
        <Icon className="text-white" size={24} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
};

export default Profile;
