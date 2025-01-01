import { Home, Video, FolderOpen, Settings, Compass, ImageIcon, Boxes } from "lucide-react";
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
    url: "/dashboard",
  },
  {
    title: "Explore",
    icon: Compass,
    url: "/explore",
  },
];

const aiAssetsItems = [
  {
    title: "AI Videos",
    icon: Video,
    url: "/videos",
    badge: "Try SoundAI 1.0",
  },
  {
    title: "AI Images",
    icon: ImageIcon,
    url: "/images",
    badge: "Coming Soon",
  },
];

const mySpaceItems = [
  {
    title: "My Creatives",
    icon: FolderOpen,
    url: "/creatives",
  },
  {
    title: "My Models",
    icon: Boxes,
    url: "/models",
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

        <SidebarGroup>
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-muted-foreground/70">AI Assets</p>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiAssetsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className="flex items-center gap-3 px-4 py-2 text-base text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-lg transition-colors"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-[#1a1f2d] text-[#4ade80]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-muted-foreground/70">My Space</p>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {mySpaceItems.map((item) => (
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