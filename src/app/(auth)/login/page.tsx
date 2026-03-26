"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Anchor } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Anchor className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              DockWatch
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Marina Maintenance Platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              {state?.error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                  {state.error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 border-t pt-4">
              <p className="mb-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
                Demo Accounts
              </p>
              <div className="space-y-1 text-xs text-slate-500">
                <p>
                  <span className="font-medium text-slate-600">Manager:</span>{" "}
                  manager@dockwatch.app
                </p>
                <p>
                  <span className="font-medium text-slate-600">Crew:</span>{" "}
                  crew@dockwatch.app
                </p>
                <p>
                  <span className="font-medium text-slate-600">Inspector:</span>{" "}
                  inspector@dockwatch.app
                </p>
                <p className="mt-1 text-slate-400">
                  Password: demo1234
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
