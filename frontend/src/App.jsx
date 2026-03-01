import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Home = lazy(() => import('./pages/deshboard/Home'));
const PracticeArena = lazy(() => import('./pages/practice/PracticeArena'));
const IDE = lazy(() => import('./pages/ide/IDE'));
const MatchArena = lazy(() => import('./pages/match/MatchArena'));
const Matchmaking = lazy(() => import('./pages/matchmaking/Matchmaking'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const Leaderboard = lazy(() => import('./pages/match/Leaderboard'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const Learning = lazy(() => import('./pages/learning/Learning'));
const AuthCallback = lazy(() => import('./pages/auth/AuthCallback'));

const GlobalLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white">
    <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
    <span className="text-xs font-black uppercase tracking-widest text-gray-500">Entering the Arena...</span>
  </div>
);

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
          <Suspense fallback={<GlobalLoader />}>
            <Routes>
              <Route path="/" element={<AuthOverlay />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/practice" element={<PrivateRoute><PracticeArena /></PrivateRoute>} />
              <Route path="/practice/:platform" element={<PrivateRoute><PracticeArena /></PrivateRoute>} />
              <Route path="/practice/arena" element={<PrivateRoute><PracticeArena /></PrivateRoute>} />
              <Route path="/ide" element={<PrivateRoute><IDE /></PrivateRoute>} />
              <Route path="/matchmaking" element={<PrivateRoute><Matchmaking /></PrivateRoute>} />
              <Route path="/arena/:matchId" element={<PrivateRoute><MatchArena /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/learning" element={<PrivateRoute><Learning /></PrivateRoute>} />
              <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </Router>
    </AuthProvider>
  );
}
