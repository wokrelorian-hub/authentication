import { cookies } from "next/headers";
import client from "@/lib/stytch";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";

export default async function HomePage() {
  // 1. Get the session token
  const cookieStore = await cookies();
  const token = cookieStore.get("stytch_session")?.value;

  if (!token) {
    redirect("/login");
  }

  // 2. Fetch User Data securely from Stytch
  let user;
  try {
    const auth = await client.sessions.authenticate({
      session_token: token
    });
    user = auth.user;
  } catch (err) {
    // FIXED: We now log the error so the variable is 'used'
    console.log("Session verification failed:", err);
    // If token is invalid (expired), force logout
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        
        <h1 className="text-5xl font-bold tracking-tight text-red-600">
          Netflix Competitor
        </h1>
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 text-left space-y-4">
          <h2 className="text-2xl font-semibold">Current Session</h2>
          
          <div className="grid gap-2">
            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm uppercase font-bold">User ID</span>
              <code className="bg-black p-2 rounded text-neutral-300 font-mono text-sm">
                {user.user_id}
              </code>
            </div>

            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm uppercase font-bold">Email</span>
              <span className="text-xl">{user.emails[0].email}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm uppercase font-bold">Status</span>
              <span className="text-green-500 font-bold flex items-center gap-2">
                ● Active Membership
              </span>
            </div>
          </div>
        </div>

        {/* 3. The Logout Button */}
        <form action={logoutAction}>
          <Button 
            variant="outline" 
            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-full h-12 text-lg"
          >
            Sign Out
          </Button>
        </form>

      </div>
    </div>
  );
}