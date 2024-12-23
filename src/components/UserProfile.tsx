import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const UserProfile = () => {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        setUsername(data.username);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarFallback>
          {username ? username[0].toUpperCase() : 'U'}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">
        {username || 'User'}
      </span>
    </div>
  );
};