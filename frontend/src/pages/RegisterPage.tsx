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

const fields = [
  { key: "organization_name" as const, label: "Agency name", type: "text", required: true, placeholder: "Enter Agency Name" },
  { key: "full_name" as const, label: "Your name", type: "text", required: false, placeholder: "Enter your Name" },
  { key: "email" as const, label: "Email", type: "email", required: true, placeholder: "Enter your Email" },
  { key: "password" as const, label: "Password", type: "password", required: true, placeholder: "Enter your Password" },
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
          <div className="mt-6 border-t border-white/[0.07] pt-4 text-center text-[12px] text-muted-foreground">
            Already have an account? {" "}
            <Button asChild className="font-medium! text-brand hover:underline bg-transparent! p-0 m-0 text-[12px]">
              <Link to={ROUTES.login}>
                Sign in
              </Link>
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {fields.map(({ key, label, type, required, placeholder }) => (
            <div key={key} className="grid gap-1.5">
              <Label className="text-[12px]" htmlFor={key}>{label}</Label>
              <Input
                id={key}
                placeholder={placeholder}
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={required}
                className="border-white/[0.07] bg-background"
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
            className="w-full bg-brand text-primary-foreground hover:bg-brand/90"
            disabled={submitting}
          >
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
