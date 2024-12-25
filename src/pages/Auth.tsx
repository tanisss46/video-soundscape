import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    
    checkUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Create a profile for the user if they don't have one
        const createProfile = async () => {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select()
            .eq('id', session.user.id)
            .maybeSingle();

          if (!existingProfile) {
            await supabase.from('profiles').insert({
              id: session.user.id,
              username: session.user.email?.split('@')[0] || 'User'
            });
          }
        };

        createProfile();
        navigate("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold gradient-text">Welcome to SoundAI</h2>
          <p className="mt-2 text-muted-foreground">Sign in to your account</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-lg border">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#7b22b4',
                    brandAccent: '#6c1d9e',
                    inputBackground: '#f1f1f1',
                    inputText: '#000000',
                    inputPlaceholder: '#666666',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
              },
            }}
            providers={["github", "google"]}
            redirectTo={`${window.location.origin}/auth/callback`}
            onlyThirdPartyProviders={false}
            view="sign_in"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;