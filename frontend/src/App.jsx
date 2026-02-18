import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AuthCallback from './pages/auth/AuthCallback';
import Home from './pages/deshboard/Home';
import PracticeHome from './pages/practice/PracticeHome';
import PracticeArena from './pages/practice/PracticeArena';
import IDE from './pages/ide/IDE';
import MatchArena from './pages/match/MatchArena';
import Matchmaking from './pages/matchmaking/Matchmaking';
import Profile from './pages/profile/Profile';

const AuthOverlay = () => {
  const { user, loading } = useAuth();
  const [view, setView] = useState('login'); // 'login' or 'register'

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white italic">Loading Arena...</div>;
  
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="relative min-h-screen bg-[#0d1117] overflow-hidden">
     
      {/* Blurred Background Home */}
      <div className="absolute inset-0 blur-sm scale-105 opacity-50 pointer-events-none">
        <Home />
      </div>

      {/* Auth Card Overlay */}
      <div className="relative z-50 min-h-screen flex items-center justify-center p-4 bg-black/20">
        <div className="w-full max-w-[450px] transform transition-all duration-500 hover:scale-[1.01]">
          {view === 'login' ? (
            <Login onSwitch={() => setView('register')} />
          ) : (
            <Register onSwitch={() => setView('login')} />
          )}
        </div>
      </div>
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white">Loading...</div>;
  return user ? children : <Navigate to="/" />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<AuthOverlay />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/practice" element={<PrivateRoute><PracticeHome /></PrivateRoute>} />
            <Route path="/practice/arena" element={<PrivateRoute><PracticeArena /></PrivateRoute>} />
            <Route path="/ide" element={<PrivateRoute><IDE /></PrivateRoute>} />
            <Route path="/matchmaking" element={<PrivateRoute><Matchmaking /></PrivateRoute>} />
            <Route path="/arena/:matchId" element={<PrivateRoute><MatchArena /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </TooltipProvider>
      </Router>
    </AuthProvider>
  );
}
