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

const fields = [
  { key: "organization_name" as const, label: "Agency name", type: "text", required: true },
  { key: "full_name" as const, label: "Your name", type: "text", required: false },
  { key: "email" as const, label: "Email", type: "email", required: true },
  { key: "password" as const, label: "Password", type: "password", required: true },
];

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    organization_name: "",
    email: "",
    password: "",
    full_name: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      toast.success("Account created — connect WhatsApp next");
      navigate("/connection");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Create agency account"
        description="Urdu & English WhatsApp replies powered by your knowledge base"
        footer={
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {fields.map(({ key, label, type, required }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={required}
                className="h-10 bg-background/50"
                autoComplete={
                  key === "password"
                    ? "new-password"
                    : key === "email"
                      ? "email"
                      : undefined
                }
              />
            </div>
          ))}
          <Button
            type="submit"
            size="lg"
            className="mt-2 h-11 w-full rounded-md text-sm font-semibold shadow-md shadow-primary/15"
            disabled={submitting}
          >
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
