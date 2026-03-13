import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth-client";
import { Mail, Lock, Loader2 } from "lucide-react";

export const Route = createFileRoute("/sign-in")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) ?? undefined,
    demo: search.demo === true || search.demo === "true" ? true : undefined,
  } as { redirect?: string; demo?: boolean }),
  component: SignInPage,
});

function SignInPage() {
  const router = useRouter();
  const { demo } = Route.useSearch();
  const [email, setEmail] = useState(demo ? "demo@orgcomms.test" : "");
  const [password, setPassword] = useState(demo ? "demopass123!" : "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Invalid credentials");
      } else {
        router.invalidate();
        const session = await authClient.getSession();
        const role = (session?.data?.user as any)?.role;
        if (role === "admin" || role === "super_admin") {
          router.navigate({ to: "/dashboard" });
        } else {
          router.navigate({ to: "/feed" });
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F3FF] p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6366F1]">
              <Mail className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#1E1B4B]">
            Welcome back
          </CardTitle>
          <CardDescription className="text-[#1E1B4B]/60">
            Sign in to your Org Comms account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1E1B4B]">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E1B4B]/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-[#6366F1]/20 focus:border-[#6366F1] focus:ring-[#6366F1]"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#1E1B4B]">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E1B4B]/40" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-[#6366F1]/20 focus:border-[#6366F1] focus:ring-[#6366F1]"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-[#1E1B4B]/60">
            Don&apos;t have an account?{" "}
            <Link
              to="/sign-up"
              className="font-medium text-[#6366F1] hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
