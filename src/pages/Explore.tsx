import { VideoLibrary } from "@/components/VideoLibrary";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";

export default function Explore() {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1">
          <Navbar />
          <main className="container mx-auto px-4 pt-16 pb-12">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-2xl font-bold mb-6">Explore Videos</h1>
              <VideoLibrary />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}