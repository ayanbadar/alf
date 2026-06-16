import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth-card";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/constants";
import { FormProvider, useForm } from "react-hook-form";
import { SignInInput, signInSchema } from "@/schema/login";
import { zodResolver } from "@hookform/resolvers/zod";
import FieldWrapper from "@/components/field-wrapper";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, token, loginSuccess, loginPending } = useAuth();

  const methods = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const { handleSubmit, register } = methods;

  if (token) return <Navigate to={ROUTES.base} replace />;

  const onSubmit = async (data: SignInInput) => {
    const { email, password } = data;
    try {
      await login(email, password);
      if (loginSuccess) {
        toast.success("Welcome back");
      }
      navigate(ROUTES.base);
    } catch (err) {
      toast.error("Login Failed");
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
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="mt-6 space-y-4">
              <FieldWrapper name="email">
                <div className="grid gap-1.5">
                  <Label className="text-[12px]">Email</Label>
                  <Input {...register("email")} placeholder="Enter your Email" className="border-white/[0.07] bg-background" />
                </div>
              </FieldWrapper>
              <FieldWrapper name="password">
                <div className="grid gap-1.5">
                  <Label className="text-[12px]">Password</Label>
                  <Input {...register("password")} type="password" placeholder="Enter Password" className="border-white/[0.07] bg-background" />
                </div>
              </FieldWrapper>
              <Button
                type="submit"
                className="w-full bg-brand text-primary-foreground hover:bg-brand/90"
              >
                {loginPending ? "Signing " : "Sign in"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </AuthCard>
    </AuthLayout>
  );
}
