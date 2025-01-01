import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VideoUpload } from "@/components/VideoUpload";

export default function CreateSoundEffect() {
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching credits:', error);
        return;
      }

      setUserCredits(profile?.credits ?? 0);
    };

    fetchUserCredits();
  }, []);

  const handleBeforeProcess = async () => {
    if (userCredits === null) return false;
    
    if (userCredits < 1) {
      toast({
        title: "Insufficient Credits",
        description: "Please purchase more credits or upgrade your plan.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleAfterProcess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Deduct one credit
    const { data, error } = await supabase
      .from('profiles')
      .update({ credits: userCredits! - 1 })
      .eq('id', user.id)
      .select('credits')
      .single();

    if (error) {
      console.error('Error updating credits:', error);
      return;
    }

    setUserCredits(data.credits);
    toast({
      title: "Success",
      description: `1 credit used. Remaining credits: ${data.credits}`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create Sound Effect</h1>
        <p className="text-muted-foreground">
          Available Credits: {userCredits ?? '...'}
        </p>
      </div>

      <VideoUpload 
        onBeforeProcess={handleBeforeProcess}
        onAfterProcess={handleAfterProcess}
      />
    </div>
  );
}