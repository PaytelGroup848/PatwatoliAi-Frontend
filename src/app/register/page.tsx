"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EnterpriseAuthView } from "@/components/auth/enterprise-auth-view";
import { WorkspaceSkeleton } from "@/components/auth/workspace-skeleton";
import { useAuthStore } from "@/stores/auth-store";

function RegisterContent() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);

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

  return <EnterpriseAuthView initialMode="signup" redirectPath="/chat" />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <RegisterContent />
    </Suspense>
  );
}
