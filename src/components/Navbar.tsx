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
  Loader2
} from "lucide-react";

export const Navbar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [processingCount, setProcessingCount] = useState<number>(0);

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

    // Subscribe to user_generations table for processing status
    const channel = supabase
      .channel('processing_count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_generations'
        },
        (payload) => {
          if (payload.new) {
            // Update processing count based on status changes
            supabase
              .from('user_generations')
              .select('*', { count: 'exact' })
              .eq('status', 'processing')
              .then(({ count }) => {
                setProcessingCount(count || 0);
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <nav className="fixed top-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b w-[calc(100%-10rem)] max-w-[1400px]">
      <div className="px-4 flex items-center justify-end h-12">
        <div className="flex items-center space-x-4">
          {processingCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{processingCount} video{processingCount > 1 ? 's' : ''} processing</span>
            </div>
          )}
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