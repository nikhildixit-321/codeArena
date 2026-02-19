import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Save, User, FileText, CheckCircle, X, AlertCircle } from 'lucide-react';

const EditProfile = ({ onCancel }) => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const [formData, setFormData] = useState({
        username: '',
        email: '', // Often email isn't editable, but we'll include it if the backend allows or for display
        bio: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Assuming the backend returns the updated user object
            const res = await api.put('/auth/profile', formData);

            // Update local context
            updateUser(res.data.user || formData);

            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Optional: Close edit mode after success
            // if (onCancel) setTimeout(onCancel, 1500);

        } catch (err) {
            console.error(err);
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Failed to update profile'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card rounded-2xl p-6 border border-border max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <User className="text-primary" size={20} />
                    Edit Profile
                </h3>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                        <User size={14} /> Username
                    </label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                        placeholder="Enter your username"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                        Bio
                    </label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none leading-relaxed"
                        placeholder="Tell us about yourself..."
                    />
                </div>

                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
                    >
                        <Save size={18} />
                        {loading ? 'Saving Changes...' : 'Save Changes'}
                    </button>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default EditProfile;
