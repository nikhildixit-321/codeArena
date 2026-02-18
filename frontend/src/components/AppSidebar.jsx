import React from "react"
import { Home, Code, Swords, Terminal, User, Settings, BookText } from "lucide-react"
import { useLocation, Link } from "react-router-dom"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        group: "Main"
    },
    {
        title: "Profile",
        url: "/profile",
        icon: User,
        group: "Main"
    },
    {
        title: "Practice",
        url: "/practice",
        icon: BookText,
        group: "Arena"
    },
    {
        title: "Battle",
        url: "/matchmaking",
        icon: Swords,
        group: "Arena"
    },
    {
        title: "IDE",
        url: "/ide",
        icon: Terminal,
        group: "Tools"
    },
]

const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
}, {})

export function AppSidebar() {
    const location = useLocation()

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <Code className="text-white" size={16} />
                    </div>
                    <span className="text-xl font-bold text-white group-data-[collapsible=icon]:hidden">CodeArena</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {Object.entries(groupedItems).map(([group, groupItems]) => (
                    <SidebarGroup key={group}>
                        {group !== "Main" && (
                            <SidebarGroupLabel className="text-[10px] font-bold text-[#444] uppercase tracking-widest mt-2 mb-1 group-data-[collapsible=icon]:hidden">
                                {group}
                            </SidebarGroupLabel>
                        )}
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {groupItems.map((item) => {
                                    const isActive = location.pathname === item.url
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                tooltip={item.title}
                                                className={`transition-all duration-200 ${isActive ? 'bg-sidebar-accent text-blue-500 font-medium' : 'text-gray-400 hover:text-gray-100'}`}
                                            >
                                                <Link to={item.url}>
                                                    <item.icon className={isActive ? "text-blue-500" : ""} />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="h-px w-full bg-[#1f1f1f] mb-2 group-data-[collapsible=icon]:hidden" />
                        <SidebarMenuButton
                            asChild
                            tooltip="Settings"
                            isActive={location.pathname === "/settings"}
                        >
                            <Link to="/settings">
                                <Settings />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
