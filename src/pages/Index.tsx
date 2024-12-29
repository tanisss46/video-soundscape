import { Navbar } from "@/components/Navbar";
import { VideoUpload } from "@/components/VideoUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ActivityPanel } from "@/components/ActivityPanel";

const Index = () => {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1">
          <Navbar />
          <main className="container mx-auto px-4 pt-24 pb-12">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <VideoUpload />
                </CardContent>
              </Card>
            </div>
          </main>
          <ActivityPanel />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;