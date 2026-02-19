import React from "react"
import {
    Home, Swords, Terminal, User, Settings,
    Trophy, Target, Zap, LogOut
} from "lucide-react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

// Curated menu items for the CodeArena project
const groups = [
    {
        id: "main",
        items: [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: Home,
                color: "text-sky-400",
                gradient: "from-sky-500/20 to-blue-600/5"
            },
            {
                title: "Profile",
                url: "/profile",
                icon: User,
                color: "text-violet-400",
                gradient: "from-violet-500/20 to-purple-600/5"
            },
            {
                title: "Leaderboard",
                url: "/leaderboard",
                icon: Trophy,
                color: "text-amber-400",
                gradient: "from-amber-500/20 to-yellow-600/5"
            },
        ]
    },
    {
        id: "arena",
        label: "ARENA",
        items: [
            {
                title: "Battle Ground",
                url: "/matchmaking",
                icon: Swords,
                color: "text-rose-500",
                gradient: "from-rose-500/20 to-red-600/5"
            },
            {
                title: "Practice",
                url: "/practice",
                icon: Target,
                color: "text-emerald-400",
                gradient: "from-emerald-500/20 to-green-600/5"
            },
        ]
    },
    {
        id: "tools",
        label: "STUDIO",
        items: [
            {
                title: "Code IDE",
                url: "/ide",
                icon: Terminal,
                color: "text-pink-400",
                gradient: "from-pink-500/20 to-fuchsia-600/5"
            },
        ]
    }
]

export function AppSidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const { logout } = useAuth()

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <Sidebar collapsible="icon" className="border-r border-white/10 bg-[#09090b] text-gray-400 font-sans">
            {/* Logo / Brand Area */}
            <div className="h-16 flex items-center justify-center border-b border-white/5">
                <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center w-full px-4 overflow-hidden">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/20 shrink-0">
                        <Zap className="text-white fill-white" size={16} />
                    </div>
                    <span className="text-lg font-black tracking-tight text-white group-data-[collapsible=icon]:hidden whitespace-nowrap">
                        Code<span className="text-purple-500">Arena</span>
                    </span>
                </div>
            </div>

            <SidebarContent className="custom-scrollbar py-4 gap-6">
                {groups.map((group) => (
                    <div key={group.id} className="px-2">
                        {/* Section Label */}
                        {group.label && (
                            <div className="px-2 mb-2 group-data-[collapsible=icon]:hidden">
                                <span className="text-[10px] font-bold tracking-[0.15em] text-gray-600 uppercase font-mono">
                                    {group.label}
                                </span>
                            </div>
                        )}

                        <SidebarGroup className="p-0 space-y-1">
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {group.items.map((item) => {
                                        const isActive = location.pathname.startsWith(item.url)
                                        return (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isActive}
                                                    tooltip={item.title}
                                                    className={`
                                                        h-11 w-full transition-all duration-300 rounded-xl group/btn relative overflow-hidden
                                                        ${isActive ? 'text-white shadow-md' : 'hover:bg-white/5 hover:text-gray-200'}
                                                    `}
                                                >
                                                    <Link to={item.url} className="flex items-center gap-3 z-10 w-full relative p-2">
                                                        {/* Active Background Gradient */}
                                                        {isActive && (
                                                            <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-100 transition-opacity`} />
                                                        )}

                                                        {/* Icon with Glow Effect on Active */}
                                                        <div className={`
                                                            relative z-10 transition-transform duration-300 group-hover/btn:scale-110
                                                            ${isActive ? item.color : "text-gray-500 group-hover/btn:text-gray-300"}
                                                            ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}
                                                        `}>
                                                            <item.icon size={20} strokeWidth={2} />
                                                        </div>

                                                        <span className={`font-bold text-sm tracking-wide z-10 ${isActive ? 'text-white' : ''}`}>
                                                            {item.title}
                                                        </span>

                                                        {/* Active Indicator Dot */}
                                                        {isActive && (
                                                            <div className={`absolute right-2 w-1.5 h-1.5 rounded-full ${item.color.replace('text-', 'bg-')} shadow-[0_0_8px_currentColor]`} />
                                                        )}
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </div>
                ))}
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-white/5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Settings"
                            className="h-10 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                            <Link to="/settings" className="flex items-center gap-3">
                                <Settings size={20} />
                                <span className="font-medium">Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            tooltip="Log Out"
                            className="h-10 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <LogOut size={20} />
                                <span className="font-medium">Log Out</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
