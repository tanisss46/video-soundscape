import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

export const Navbar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");

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
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <nav className="fixed top-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex items-center justify-end h-16">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden md:block">{username}</span>
          </div>
          <Button onClick={handleSignOut} variant="ghost">Sign Out</Button>
        </div>
      </div>
    </nav>
  );
};