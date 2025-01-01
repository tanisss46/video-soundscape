import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const SearchInput = () => {
  return (
    <div className="relative w-full md:w-96">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input 
        placeholder="Search sound effects..." 
        className="pl-10 bg-accent/50 border-accent"
      />
    </div>
  );
};