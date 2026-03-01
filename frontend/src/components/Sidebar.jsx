import React, { useState } from 'react';
import { Home, Code, Swords, Terminal, User, Settings, BookText, Menu, X, GraduationCap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const SidebarItem = ({ icon: Icon, label, to, isMobile = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  if (isMobile) {
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
      >
        <Icon size={18} />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
            className={`relative flex items-center justify-center p-3 rounded-lg transition-all duration-300 group mb-2 ${isActive
              ? 'text-blue-500 bg-blue-500/10'
              : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50'
              }`}
          >
            {/* Active Indicator on Left */}
            {isActive && (
              <div
                className="absolute w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                style={{ left: '-12px' }}
              />
            )}

            <Icon
              size={20}
              strokeWidth={isActive ? 2.5 : 2}
              className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'group-hover:scale-110'}`}
            />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-[#0a0a0a] border border-[#1f1f1f] text-gray-200 font-medium ml-2">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Section Divider with Label
const SectionDivider = ({ label }) => (
  <div className="w-full flex flex-col items-center my-2">
    <div className="h-px w-8 bg-[#1f1f1f]" />
    {label && (
      <span className="text-[9px] font-bold text-[#444] uppercase tracking-[0.1em] mt-2 mb-1">
        {label}
      </span>
    )}
  </div>
);

const Sidebar = ({ isMobile = false }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4 border-r border-[#1f1f1f] bg-[#050505]">
          <div className="flex flex-col space-y-4">
            <div className="mb-6 flex items-center gap-2 px-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Code className="text-white" size={16} />
              </div>
              <span className="text-xl font-bold text-white">CodeArena</span>
            </div>
            <SidebarItem to="/dashboard" icon={Home} label="Dashboard" isMobile={true} />
            <SidebarItem to="/learning" icon={GraduationCap} label="Learning" isMobile={true} />
            <SidebarItem to="/practice" icon={BookText} label="Practice" isMobile={true} />
            <SidebarItem to="/matchmaking" icon={Swords} label="Battle" isMobile={true} />
            <SidebarItem to="/ide" icon={Terminal} label="IDE" isMobile={true} />
            <SidebarItem to="/profile" icon={User} label="Profile" isMobile={true} />
            <SidebarItem to="/settings" icon={Settings} label="Settings" isMobile={true} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop Sidebar
  return (
    <div className="hidden lg:flex h-full w-16 bg-[#050505] border-r border-[#1f1f1f] flex-col items-center py-6 z-50">
      {/* Brand Icon */}
      <div className="mb-8 flex items-center justify-center">
        <Link to="/dashboard">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10 group cursor-pointer hover:scale-105 transition-transform">
            <Code className="text-white group-hover:rotate-12 transition-transform duration-300" size={18} />
          </div>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col items-center gap-1 w-full">
        {/* Main */}
        <SidebarItem to="/dashboard" icon={Home} label="Dashboard" />
        <SidebarItem to="/learning" icon={GraduationCap} label="Learning" />
        <SidebarItem to="/profile" icon={User} label="Profile" />

        <SectionDivider label="Arena" />

        {/* Practice/Battle */}
        <SidebarItem to="/practice" icon={BookText} label="Practice" />
        <SidebarItem to="/matchmaking" icon={Swords} label="Battle" />

        <SectionDivider label="Tools" />

        {/* Tools */}
        <SidebarItem to="/ide" icon={Terminal} label="IDE" />
      </nav>

      <div className="mt-auto mb-4 flex flex-col items-center w-full">
        <div className="h-px w-8 bg-[#1f1f1f] mb-4" />
        <SidebarItem to="/settings" icon={Settings} label="Settings" />
      </div>
    </div>
  );
};

const ResponsiveSidebar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Sidebar isMobile={false} />
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Sidebar isMobile={true} />
      </div>
    </>
  );
};

export default ResponsiveSidebar;