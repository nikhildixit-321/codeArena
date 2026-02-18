import React, { useState } from 'react';
import { Home, Code, Swords, Terminal, User, Settings, BookText, Menu, X } from 'lucide-react';
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
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          isActive
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
            className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Icon size={20} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

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
        <SheetContent side="left" className="w-64 p-4">
          <div className="flex flex-col space-y-4">
            <div className="mb-6 flex items-center gap-2 px-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Code className="text-primary-foreground" size={16} />
              </div>
              <span className="text-xl font-bold">CodeArena</span>
            </div>
            <SidebarItem to="/dashboard" icon={Home} label="Dashboard" isMobile={true} />
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

  return (
    <div className="hidden lg:flex fixed left-0 top-0 h-screen w-16 bg-background border-r border-border flex-col items-center py-4 z-50">
      <div className="mb-8 flex items-center justify-center">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Code className="text-primary-foreground" size={16} />
        </div>
      </div>

      <nav className="flex-1 flex flex-col items-center gap-2">
        <SidebarItem to="/dashboard" icon={Home} label="Dashboard" />
        <SidebarItem to="/practice" icon={BookText} label="Practice" />
        <SidebarItem to="/matchmaking" icon={Swords} label="Battle" />
        <SidebarItem to="/ide" icon={Terminal} label="IDE" />
        <SidebarItem to="/profile" icon={User} label="Profile" />
      </nav>

      <div className="mt-auto mb-4">
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