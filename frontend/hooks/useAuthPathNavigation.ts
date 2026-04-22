import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * Navigate to an in-app path, sending unauthenticated users through Clerk with redirect back.
 */
export function useAuthPathNavigation() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  return useCallback(
    (path: string) => {
      if (isSignedIn) {
        router.push(path);
        return;
      }
      router.push(`/sign-in?redirect_url=${encodeURIComponent(path)}`);
    },
    [isSignedIn, router],
  );
}
