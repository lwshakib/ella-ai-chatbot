import { Button } from "@/components/ui/button";
import { Home, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Conversation Not Found
          </h1>
          <p className="text-muted-foreground max-w-md">
            The conversation you're looking for doesn't exist or has been
            deleted. It may have been removed or you don't have permission to
            access it.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <MessageSquare className="w-4 h-4 mr-2" />
            Start New Conversation
          </Link>
        </Button>
      </div>
    </div>
  );
}
