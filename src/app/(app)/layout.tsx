import { requireAuth } from "@/lib/auth/guards";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  return (
    <AppShell name={session.name} email={session.email} role={session.role}>
      {children}
    </AppShell>
  );
}
