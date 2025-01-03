import { ActivityIndicator } from "./navbar/ActivityIndicator";
import { UserMenu } from "./navbar/UserMenu";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 right-0 z-50 bg-web3-background/80 backdrop-blur-sm border-b border-web3-surface/50 w-[calc(100%-16rem)] max-w-[1400px]">
      <div className="px-6 flex items-center justify-end h-16">
        <div className="flex items-center space-x-4">
          <ActivityIndicator />
          <UserMenu />
        </div>
      </div>
    </nav>
  );
};