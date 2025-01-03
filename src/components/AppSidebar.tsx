import { Compass, Video, FolderOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Explore",
    icon: Compass,
    url: "/explore",
  },
  {
    title: "Create Sound Effect",
    icon: Video,
    url: "/create-sound-effect",
  },
  {
    title: "My Videos",
    icon: FolderOpen,
    url: "/my-videos",
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="w-64 border-r border-web3-surface/50 bg-web3-background">
      <SidebarContent>
        <div className="p-4">
          <h1 className="text-2xl font-bold gradient-text">SoundAI</h1>
        </div>
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className={`web3-nav-item ${location.pathname === item.url ? 'web3-nav-item-active' : ''}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}