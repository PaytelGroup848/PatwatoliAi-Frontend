"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EnterpriseAuthView } from "@/components/auth/enterprise-auth-view";
import { WorkspaceSkeleton } from "@/components/auth/workspace-skeleton";
import { useAuthStore } from "@/stores/auth-store";

function RegisterContent() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state.hydrated);

  useEffect(() => {
    if (hydrated && accessToken) {
      router.replace("/chat");
    }
  }, [hydrated, accessToken, router]);

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
