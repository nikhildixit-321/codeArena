import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"

const MainLayout = ({ children, navbar }) => {
    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
                {/* Optional Top Navbar */}
                {navbar && (
                    <div className="w-full shrink-0 border-b border-border bg-background z-20">
                        {navbar}
                    </div>
                )}

                {/* Main Workspace Area: Sidebar (left) + Content (right) */}
                <div className="flex flex-1 overflow-hidden relative">
                    <AppSidebar />

                    <main className="flex-1 min-w-0 bg-background relative overflow-y-auto group/main transition-all duration-300">
                        {/* Mobile Sidebar Trigger - Always available on mobile */}
                        <div className="md:hidden absolute top-4 left-4 z-50 pointer-events-auto">
                            <SidebarTrigger />
                        </div>

                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default MainLayout;