"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { EnterpriseAuthView } from "@/components/auth/enterprise-auth-view";
import { WorkspaceSkeleton } from "@/components/auth/workspace-skeleton";
import { useAuthStore } from "@/stores/auth-store";

function LoginContent() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode") || searchParams.get("auth");
  const initialMode = modeParam === "signup" ? "signup" : "login";

  useEffect(() => {
    // Only redirect if the user is an actual authenticated member (not a temporary guest)
    const isRealMember = Boolean(accessToken && user && user.role !== "guest");
    if (hydrated && isRealMember) {
      router.replace("/chat");
    }
  }, [hydrated, accessToken, user, router]);

  if (!hydrated) {
    return <WorkspaceSkeleton />;
  }

  return <EnterpriseAuthView initialMode={initialMode} redirectPath="/chat" />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}
