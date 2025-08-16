"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

function LibrarySkeleton() {
  return (
    <div className="p-4">
      {/* Title skeleton */}
      <Skeleton className="h-8 w-48 mb-4" />

      {/* Grid skeleton */}
      <div
        className="
          columns-1
          sm:columns-2
          md:columns-3
          lg:columns-4
          gap-4
          space-y-4
        "
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="relative mb-4 break-inside-avoid">
            {/* Image skeleton */}
            <Skeleton className="w-full aspect-square rounded-lg" />
            {/* Download button skeleton */}
            <Skeleton className="absolute top-2 right-2 w-9 h-9 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const images = useQuery(api.functions.getGeneratedImages);

  if (!images) {
    return <LibrarySkeleton />;
  }

  if (images.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Image Library</h1>
        <div className="text-center text-gray-500 mt-8">No images found.</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Image Library</h1>
      <div
        className="
          columns-1
          sm:columns-2
          md:columns-3
          lg:columns-4
          gap-4
          space-y-4
        "
      >
        {images.map((img: any) => (
          <div key={img._id} className="relative mb-4 break-inside-avoid">
            <img
              src={img.imageUrl}
              alt={img.text || "Generated image"}
              className="w-full rounded-lg shadow-md"
              style={{ display: "block" }}
            />
            <a
              href={img.imageUrl}
              download
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition"
              title="Download image"
            >
              {/* Download SVG icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
