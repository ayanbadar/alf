import { useEffect, useState } from "react";
import { Building2, User } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { ThemeSelector } from "@/components/theme-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useUpdateUser } from "@/api/auth/auth-api";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileSchemaType } from "@/schema/profile";
import FieldWrapper from "@/components/field-wrapper";

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} readOnly className="bg-muted/40" />
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const methods = useForm<ProfileSchemaType>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.full_name ?? "" }
  });

  const fullName = methods.watch("fullName") ?? "";

  const { handleSubmit, register, formState } = methods;

  const { mutateAsync: handleUpdateUserAsync, isSuccess: userUpdatedSuccess, isPending: userUpdatePending } = useUpdateUser();

  if (userUpdatedSuccess) {
    toast.success("Full Name Updated Successfully");
  };

  const onSubmit = async (data: ProfileSchemaType) => {
    const { fullName } = data;
    await handleUpdateUserAsync({ fullName });
  };

  if (!user) return null;

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader
        title="Settings"
        description="Your profile, agency details, and app preferences."
      />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="size-5 text-primary" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>Update how your name appears in the dashboard.</CardDescription>
        </CardHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FieldWrapper name="fullName">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Display name</Label>
                  <Input
                    {...register("fullName")}
                    id="full_name"
                    placeholder="Your name"
                    value={fullName}
                  />
                </div>
              </FieldWrapper>
              <ReadOnlyField label="Email" value={user.email} />
              <div className="space-y-2">
                <Label>Role</Label>
                <div>
                  <Badge variant="secondary" className="capitalize">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={userUpdatePending || formState?.fullName?.trim() === user.full_name}
              >
                {userUpdatePending ? "Saving…" : "Save profile"}
              </Button>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            <CardTitle>Organization</CardTitle>
          </div>
          <CardDescription>Your agency workspace on ALF (read-only).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ReadOnlyField label="Agency name" value={user.organization_name} />
          <ReadOnlyField label="Workspace ID" value={String(user.organization_id)} />
          {user.organization_slug && (
            <ReadOnlyField label="Slug" value={user.organization_slug} />
          )}
          {user.organization_timezone && (
            <ReadOnlyField label="Timezone" value={user.organization_timezone} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Light, dark, or match your device settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSelector />
        </CardContent>
      </Card>
    </div>
  );
}
