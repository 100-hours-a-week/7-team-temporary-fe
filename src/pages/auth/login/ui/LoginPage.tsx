"use client";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/entities/auth/model";
import { LoginForm } from "@/features/auth/login/ui";

export function LoginPage() {
  const router = useRouter();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const handleSuccess = (accessToken: string) => {
    setAuthenticated(accessToken);
    router.replace("/home");
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-8 text-left">
      <LoginForm onSuccess={handleSuccess} />
    </main>
  );
}
