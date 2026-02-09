import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import HomeNavbar from "../components/Navbar";


export default function Home() {
  

  return (
    <div className="relative min-h-screen bg-black text-white">

      {/* 👇 GAME LAYOUT (EXACT SAME AS PEHLE) */}
      <div className={` "blur-md pointer-events-none" : ""}`}>
        <div className="min-h-screen flex">

          {/* LEFT SIDEBAR */}
          <div className="w-64  bg-gray-950 border-r border-gray-800 p-4">
            <h2 className="text-purple-500 font-bold mb-4">Modes</h2>
            <button className="w-full mb-2 py-2 bg-gray-900 rounded">
              Quick Match
            </button>
            <button className="w-full py-2 bg-gray-900 rounded">
              Practice
            </button>
          </div>

          {/* CENTER CONTENT */}
          <div className="flex-1 p-6">

            <HomeNavbar />

            <div className="mt-6 space-y-6">
              <div className="h-60 rounded-xl bg-gradient-to-br from-purple-800 to-black flex items-center justify-center">
                <h1 className="text-3xl font-bold">
                  Ready for Battle?
                </h1>
              </div>

              <div>
                <h3 className="mb-2">Live Battles</h3>
                <div className="flex gap-4">
                  <div className="w-48 h-24 bg-gray-900 rounded"></div>
                  <div className="w-48 h-24 bg-gray-900 rounded"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      

     
      
    </div>
  );
}
