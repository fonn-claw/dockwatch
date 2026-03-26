"use server";

import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod/v4";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ROLE_REDIRECTS: Record<string, string> = {
  manager: "/dashboard",
  crew: "/work-orders",
  inspector: "/compliance",
};

export async function login(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Invalid email or password" };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (!user || !(await compare(parsed.data.password, user.passwordHash))) {
    return { error: "Invalid email or password" };
  }

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.name = user.name;
  session.role = user.role;
  session.isLoggedIn = true;
  await session.save();

  redirect(ROLE_REDIRECTS[user.role] || "/dashboard");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
