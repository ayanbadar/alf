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
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpInput, signUpSchema } from "@/schema/register";
import FieldWrapper from "@/components/field-wrapper";

export default function RegisterPage() {
  const navigate = useNavigate();

  const methods = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema)
  });

  const { register: handleRegisterForm, token, registerPending } = useAuth();

  const { handleSubmit, register } = methods;

  if (token) return <Navigate to={ROUTES.base} replace />;

  const onSubmit = async (data: SignUpInput) => {
    try {
      await handleRegisterForm(data);
      toast.success("Account created — connect WhatsApp next");
      navigate(ROUTES.connection);
    } catch (err) {
      toast.error("Account Register Failed");
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
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FieldWrapper name="organization_name">
              <div className="grid gap-1.5">
                <Label className="text-[12px]" htmlFor="agency-name">Agency name</Label>
                <Input
                  {...register("organization_name")}
                  id="agency-name"
                  placeholder="Enter Agency Name"
                  type="text"
                  className="border-white/[0.07] bg-background"
                />
              </div>
            </FieldWrapper>
            <FieldWrapper name="name">
              <div className="grid gap-1.5">
                <Label className="text-[12px]" htmlFor="name">Name</Label>
                <Input
                  {...register("name")}
                  id="agency-name"
                  placeholder="Enter Your Name"
                  type="text"
                  className="border-white/[0.07] bg-background"
                />
              </div>
            </FieldWrapper>
            <FieldWrapper name="email">
              <div className="grid gap-1.5">
                <Label className="text-[12px]" htmlFor="email">Email</Label>
                <Input
                  {...register("email")}
                  id="email"
                  placeholder="Enter Your Email"
                  type="text"
                  className="border-white/[0.07] bg-background"
                />
              </div>
            </FieldWrapper>
            <FieldWrapper name="password">
              <div className="grid gap-1.5">
                <Label className="text-[12px]" htmlFor="email">Password</Label>
                <Input
                  {...register("password")}
                  id="email"
                  placeholder="Enter Password"
                  type="text"
                  className="border-white/[0.07] bg-background"
                />
              </div>
            </FieldWrapper>
            <Button
              type="submit"
              className="w-full bg-brand text-primary-foreground hover:bg-brand/90"
              disabled={registerPending}
            >
              {registerPending ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </FormProvider>
      </AuthCard>
    </AuthLayout>
  );
}
