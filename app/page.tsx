"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/themeToggle";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <div className='p-24'>
      <h1 className='text-2xl font-bold'>Home</h1>
      <ThemeToggle />

      {session ? (
        <div>
          <p>{session.user.name}</p>
          <Button className='' onClick={signOut}>
            Logout
          </Button>
        </div>
      ) : (
        <Button>Login</Button>
      )}
    </div>
  );
}
