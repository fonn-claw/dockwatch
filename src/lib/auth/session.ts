import { SessionOptions } from "iron-session";

export interface SessionData {
  userId: number;
  email: string;
  name: string;
  role: "manager" | "crew" | "inspector";
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "dockwatch-session",
  ttl: 60 * 60 * 24 * 7, // 7 days
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

export async function getSession() {
  const { cookies } = await import("next/headers");
  const { getIronSession } = await import("iron-session");
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
