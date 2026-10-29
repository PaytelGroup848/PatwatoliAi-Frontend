"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { EnterpriseAuthView } from "@/components/auth/enterprise-auth-view";
import { WorkspaceSkeleton } from "@/components/auth/workspace-skeleton";
import { useAuthStore } from "@/stores/auth-store";

function LoginContent() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state.hydrated);
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode") || searchParams.get("auth");
  const initialMode = modeParam === "signup" ? "signup" : "login";

  useEffect(() => {
    if (hydrated && accessToken) {
      router.replace("/chat");
    }
  }, [hydrated, accessToken, router]);

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
