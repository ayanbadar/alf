import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth-card";
import { AuthLayout } from "@/components/auth-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/constants";

export default function LoginPage() {
  console.log('component is called');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: any) => {
    console.log('submitted');
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Sign in"
        description="Access your agency dashboard"
        footer={
          <div className="mt-6 border-t border-white/[0.07] pt-4 text-center text-[12px] text-muted-foreground">
            No account?{" "}
            <Button asChild className="font-medium! text-brand hover:underline bg-transparent! p-0 m-0 text-[12px] h-auto">
              <Link to={ROUTES.register}>
                Create agency account
              </Link>
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="mt-6 space-y-4">
            <div className="grid gap-1.5">
              <Label className="text-[12px]">Email</Label>
              <Input onChange={(e) => setEmail(e.target.value)} placeholder="Enter your Email" className="border-white/[0.07] bg-background" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-[12px]">Password</Label>
              <Input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter Password" className="border-white/[0.07] bg-background" />
            </div>
            <Button
              type="submit"
              className="w-full bg-brand text-primary-foreground hover:bg-brand/90"
            >
              {submitting ? "Signing " : "Sign in"}
            </Button>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
