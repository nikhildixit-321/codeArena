import { Link } from "react-router-dom";
import { FaBell, FaFire, FaGamepad, FaBrain, FaUser } from "react-icons/fa";

export default function HomeNavbar() {
  return (
    <div className="w-full h-14 bg-gray-950/80 backdrop-blur border border-gray-800 rounded-lg flex items-center justify-between px-6 text-white">

      {/* Left */}
      <Link to="/dashboard" className="flex items-center gap-2 text-purple-500 font-bold text-lg hover:opacity-80 transition-opacity">
        ⚔️ CodeArena
      </Link>
      

      {/* Center */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-red-500 animate-pulse">
          🔴 128 Live
        </span>

        <Link to="/matchmaking" className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded hover:bg-purple-600 transition">
          <FaGamepad /> Quick
        </Link>

        <Link to="/practice" className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded hover:bg-purple-600 transition">
          <FaBrain /> Practice
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <span className="px-3 py-1 text-sm rounded bg-purple-600">
          Gold II
        </span>

        <span className="flex items-center gap-1 text-orange-400 text-sm">
          <FaFire /> x5
        </span>

        <span className="text-yellow-400 text-sm">💰 120</span>

        <FaBell className="cursor-pointer hover:text-purple-500" />

        <Link to="/profile" className="hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full border border-gray-700 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <FaUser className="text-white text-sm" />
          </div>
        </Link>
      </div>
    </div>
  );
}
