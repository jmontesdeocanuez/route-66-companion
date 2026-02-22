import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ChangePasswordForm } from "@/components/change-password-form";
import { EditProfileForm } from "@/components/edit-profile-form";

export const metadata = {
  title: "Perfil — Route 66 Companion",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function PerfilPage() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      avatar: true,
      displayName: true,
      nickname: true,
      bio: true,
      nationality: true,
      phone: true,
      emergencyContact: true,
      dietaryRestrictions: true,
      allergies: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-start p-6 pt-24">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold select-none">
            {getInitials(user.name)}
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">{user.displayName ?? user.name}</p>
            {user.displayName && (
              <p className="text-sm text-muted-foreground">{user.name}</p>
            )}
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <EditProfileForm
            initialValues={{
              displayName: user.displayName ?? "",
              nickname: user.nickname ?? "",
              bio: user.bio ?? "",
              nationality: user.nationality ?? "",
              phone: user.phone ?? "",
              emergencyContact: user.emergencyContact ?? "",
              dietaryRestrictions: user.dietaryRestrictions ?? "",
              allergies: user.allergies ?? "",
            }}
          />
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  );
}
