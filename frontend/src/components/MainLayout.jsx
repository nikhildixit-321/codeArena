import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"

import ChallengeNotification from './ChallengeNotification';

const MainLayout = ({ children, navbar }) => {
    const [open, setOpen] = useState(false);

    return (
        <SidebarProvider open={open} onOpenChange={setOpen}>
            <div className="flex flex-col h-screen w-full bg-background overflow-hidden transition-colors duration-300">
                <ChallengeNotification />
                {/* Optional Top Navbar */}
                {navbar && (
                    <div className="w-full shrink-0 border-b border-border bg-background z-20">
                        {navbar}
                    </div>
                )}

                {/* Main Workspace Area: Sidebar (left) + Content (right) */}
                <div className="flex flex-1 overflow-hidden relative">
                    <div
                        onMouseEnter={() => setOpen(true)}
                        onMouseLeave={() => setOpen(false)}
                        className="h-full z-30"
                    >
                        <AppSidebar />
                    </div>

                    {/* Content Area */}
                    <main className="flex-1 min-w-0 bg-background relative overflow-y-auto group/main transition-all duration-300">
                        {/* Mobile Sidebar Trigger - Always available on mobile */}
                        <div className="md:hidden absolute top-4 left-4 z-50 pointer-events-auto">
                            <SidebarTrigger />
                        </div>

                        {children}

                        {/* Global Footer */}
                        <footer className="py-6 text-center border-t border-white/5 mt-auto">
                            <p className="text-xs text-gray-500 font-mono">
                                © {new Date().getFullYear()} CodeArena. All Rights Reserved.
                            </p>
                        </footer>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default MainLayout;