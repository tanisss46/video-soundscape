import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Settings, 
  HelpCircle, 
  Video, 
  CreditCard, 
  Coins, 
  Moon, 
  LogOut,
  Info,
  Loader2,
  Activity
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export const Navbar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [processingVideos, setProcessingVideos] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .maybeSingle();
          
          if (data?.username) {
            setUsername(data.username);
          } else {
            setUsername(user.email?.split('@')[0] || 'User');
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setUsername('User');
      }
    };

    getProfile();

    // Subscribe to changes in user_generations table
    const channel = supabase
      .channel('user_generations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_generations'
        },
        (payload) => {
          console.log('Change received!', payload);
          if (payload.new && payload.eventType === 'INSERT') {
            setProcessingVideos(prev => [...prev, payload.new]);
            toast({
              title: "New Video Processing",
              description: "Your video is being processed...",
            });
          } else if (payload.new && payload.eventType === 'UPDATE') {
            const updatedVideo = payload.new;
            setProcessingVideos(prev => 
              prev.map(video => 
                video.id === updatedVideo.id ? updatedVideo : video
              ).filter(video => video.status !== 'completed' && video.status !== 'error')
            );
            
            if (updatedVideo.status === 'completed') {
              toast({
                title: "Video Ready!",
                description: "Your video has been processed successfully.",
              });
            } else if (updatedVideo.status === 'error') {
              toast({
                title: "Processing Error",
                description: updatedVideo.error_message || "An error occurred while processing your video.",
                variant: "destructive",
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <nav className="fixed top-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b w-[calc(100%-10rem)] max-w-[1400px]">
      <div className="px-4 flex items-center justify-end h-12">
        <div className="flex items-center space-x-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Activity className="h-5 w-5" />
                {processingVideos.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {processingVideos.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Activity</h2>
              </div>
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="space-y-4">
                  {processingVideos.map((video) => (
                    <div
                      key={video.id}
                      className="p-4 rounded-lg border bg-card text-card-foreground"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">Video Processing</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {video.prompt || "No prompt provided"}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          video.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : video.status === 'error'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {video.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{username}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Video className="mr-2 h-4 w-4" />
                <span>Video tutorials</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>My plan</span>
                <span className="ml-auto text-xs text-muted-foreground">Plus</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Coins className="mr-2 h-4 w-4" />
                <span>Credits</span>
                <span className="ml-auto text-xs text-muted-foreground">875 left</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Moon className="mr-2 h-4 w-4" />
                <span>Relaxed mode</span>
                <Info className="ml-auto h-4 w-4 text-muted-foreground" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};