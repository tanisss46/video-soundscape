import { Compass, Video, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
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
  return (
    <Sidebar className="w-64 border-r border-border/50 bg-[#0f111a]">
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
                      className="flex items-center gap-3 px-4 py-2 text-base text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-lg transition-colors"
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