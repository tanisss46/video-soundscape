import { Home, Video, FolderOpen, Settings, Compass } from "lucide-react";
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
    title: "Home",
    icon: Home,
    url: "/",
  },
  {
    title: "Explore",
    icon: Compass,
    url: "/explore",
  },
  {
    title: "AI Videos",
    icon: Video,
    url: "/videos",
  },
  {
    title: "My Creatives",
    icon: FolderOpen,
    url: "/creatives",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="w-40 border-r border-border/50">
      <SidebarContent>
        <div className="p-3">
          <h1 className="text-lg font-bold gradient-text">SoundAI</h1>
        </div>
        <SidebarGroup>
          <div className="px-2 py-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">Menu</p>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url} className="flex items-center gap-2 px-2 py-1.5 text-sm">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}