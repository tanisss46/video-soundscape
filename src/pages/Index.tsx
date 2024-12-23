import { Navbar } from "@/components/Navbar";
import { VideoUpload } from "@/components/VideoUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/components/UserProfile";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <UserProfile />
      </Navbar>
      <main className="container mx-auto px-4 pt-24">
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
    </div>
  );
};

export default Index;