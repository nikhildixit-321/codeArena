import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HomeNavbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex flex-1">
        
        {/* LEFT SIDEBAR */}
        <div className="w-64 bg-gray-950 border-r border-gray-800 p-4 shrink-0">
          <div className="mb-8 px-2">
            <Link to="/dashboard" className="text-xl font-black text-purple-500 italic uppercase tracking-tighter hover:opacity-80 transition-opacity block">CodeArena</Link>
          </div>

          <h2 className="text-purple-500 font-bold mb-4 px-2 text-xs uppercase tracking-widest">Modes</h2>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/matchmaking')}
              className="w-full py-3 bg-gray-900 hover:bg-purple-600 transition-colors rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
            >
              Quick Match ⚔️
            </button>
            <button 
              onClick={() => navigate('/practice')}
              className="w-full py-3 bg-gray-900 hover:bg-purple-600 transition-colors rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
            >
              Practice 🧠
            </button>
            <button 
              onClick={() => navigate('/ide')}
              className="w-full py-3 bg-gray-900 hover:bg-purple-600 transition-colors rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
            >
              IDE 💻
            </button>
          </div>

          <div className="mt-12 px-2">
             <h2 className="text-gray-500 font-bold mb-4 text-xs uppercase tracking-widest">Stats</h2>
             <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <div className="text-xs text-gray-500 mb-1">Current Rating</div>
                <div className="text-2xl font-black text-yellow-500">{user?.rating || 1200}</div>
             </div>
          </div>
        </div>

        {/* CENTER CONTENT */}
        <div className="flex-1 p-6 overflow-y-auto">
          <HomeNavbar />

          <div className="mt-6 space-y-8">
            {/* HERO BANNER */}
            <div className="h-64 rounded-2xl bg-gradient-to-br from-purple-800 via-purple-950 to-black border border-purple-500/20 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <h1 className="text-4xl font-black mb-4 z-10 group-hover:scale-105 transition-transform">
                Ready for Battle?
              </h1>
              <p className="text-purple-200/60 z-10 max-w-md">
                Test your logic against global competitors in the ultimate coding arena.
              </p>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full"></div>
            </div>

            {/* LIVE BATTLES SECTION */}
            <div>
              <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Live Battles
                </h3>
                <button className="text-sm text-purple-500 hover:underline">View All</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-950 border border-gray-800 p-5 rounded-2xl hover:border-purple-500/50 transition-all group">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-xs font-mono text-gray-500">#MATCH_{2024 + i}</div>
                      <span className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">Active</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 py-2 text-sm font-bold">
                      <div className="text-center">
                        <div className="w-10 h-10 bg-gray-900 rounded-full mb-2 mx-auto border border-gray-800"></div>
                        User_{i}
                      </div>
                      <div className="text-purple-500 italic">VS</div>
                      <div className="text-center">
                        <div className="w-10 h-10 bg-gray-900 rounded-full mb-2 mx-auto border border-gray-800"></div>
                        Player_{i+5}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
