import { getSession, SessionData } from "./session";
import { redirect } from "next/navigation";

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/login");
  }
  return session as SessionData;
}

export async function requireRole(
  allowedRoles: SessionData["role"][]
): Promise<SessionData> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    redirect("/dashboard");
  }
  return session;
}
