"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useAIStore } from "@/lib/zustand";
import { useMutation } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SearchResult {
  _id: string;
  title: string;
  updatedAt: string;
  // Add other fields if needed
}

export function SearchDialog() {
  const { isSearchDialogOpen, closeSearchDialog } = useAIStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const searchConversation = useMutation(api.functions.searchConversation);

  const handleClose = () => {
    closeSearchDialog();
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchConversation({
        searchTerm: query,
      });
      setSearchResults(results); // <-- Show results in UI
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleResultClick = (result: SearchResult) => {
    console.log(result);
    handleClose();
    router.push(`/c/${result._id}`);
  };

  return (
    <Dialog open={isSearchDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Conversations
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="pl-10"
              autoFocus
            />
          </div>

          {isSearching && (
            <div className="text-center text-muted-foreground py-4">
              Searching...
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((result) => (
                <div
                  key={result._id}
                  className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="font-medium text-sm">{result.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {formatDistanceToNow(new Date(result.updatedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isSearching && searchQuery && searchResults.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              No conversations found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
