import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/auth/session";

const ROLE_REDIRECTS: Record<string, string> = {
  manager: "/dashboard",
  crew: "/work-orders",
  inspector: "/compliance",
};

export default async function RootPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );

  if (session.isLoggedIn && session.role) {
    redirect(ROLE_REDIRECTS[session.role] || "/dashboard");
  }

  redirect("/login");
}
