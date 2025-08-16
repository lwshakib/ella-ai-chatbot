"use client";
import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <div className="w-full h-full flex items-center justify-center">

        <UserProfile />

    </div>
  );
}
