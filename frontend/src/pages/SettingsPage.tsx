import { FormEvent, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
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

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} readOnly className="bg-muted/40" />
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? "");

  useEffect(() => {
    setFullName(user?.full_name ?? "");
  }, [user?.full_name]);

  const saveProfile = useMutation({
    mutationFn: () => updateProfile(fullName.trim()),
    onSuccess: () => toast.success("Profile updated"),
    onError: () => toast.error("Failed to update profile"),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    saveProfile.mutate();
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
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Display name</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
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
              disabled={
                saveProfile.isPending || fullName.trim() === user.full_name
              }
            >
              {saveProfile.isPending ? "Saving…" : "Save profile"}
            </Button>
          </CardFooter>
        </form>
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
