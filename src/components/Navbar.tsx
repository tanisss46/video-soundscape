import { ActivityIndicator } from "./navbar/ActivityIndicator";
import { UserMenu } from "./navbar/UserMenu";
import { SearchInput } from "./explore/SearchInput";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 right-0 z-50 bg-[#0f111a]/80 backdrop-blur-sm border-b border-border/50 w-[calc(100%-16rem)] max-w-[1400px]">
      <div className="px-6 flex items-center justify-between h-16">
        <SearchInput />
        <div className="flex items-center space-x-4">
          <ActivityIndicator />
          <UserMenu />
        </div>
      </div>
    </nav>
  );
};